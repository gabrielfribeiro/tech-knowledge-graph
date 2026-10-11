using System;
using System.Data;
using System.Threading.Tasks;
using Dapper;

namespace LegacyOrderApi.Services
{
    public class OrderService
    {
        private readonly IDbConnection _db;

        public OrderService(IDbConnection db)
        {
            _db = db;
        }

        public FreightValidationResult ValidateFreight(string customerTier, decimal netTotal)
        {
            var normalizedTier = customerTier?.Trim();
            if (netTotal >= 500m || string.Equals(normalizedTier, "DIAMOND", StringComparison.OrdinalIgnoreCase))
            {
                return FreightValidationResult.Free("FREIGHT_VIP_RULE");
            }

            return FreightValidationResult.Paid(39.90m);
        }

        public async Task<OrderResult> CalculateAndCreateOrderAsync(string customerId, string customerTier, decimal itemsTotal, int maxSkuQuantity, string paymentMethod)
        {
            // Regra 1: Desconto progressivo atacado (12% se >= 10 unidades do mesmo SKU)
            decimal discount = maxSkuQuantity >= 10 ? Math.Round(itemsTotal * 0.12m, 2) : 0m;
            decimal netTotal = itemsTotal - discount;

            // Regra 2: Frete Grátis acima de R$ 500 ou cliente DIAMOND
            var freightValidation = ValidateFreight(customerTier, netTotal);
            decimal freight = freightValidation.FreightAmount;

            // Regra 3: Verificar inadimplência > 15 dias em compras a prazo (BOLETO_PRAZO)
            if (paymentMethod == "BOLETO_PRAZO")
            {
                const string sqlOverdue = @"
                    SELECT COUNT(1)
                    FROM BILLING_CORE.TB_INVOICES i
                    WHERE i.ID_CUSTOMER = :p_customer_id
                      AND i.ST_INVOICE  = 'OVERDUE'
                      AND i.DT_VENCIMENTO < SYSDATE - 15";

                int overdueCount = await _db.ExecuteScalarAsync<int>(sqlOverdue, new { p_customer_id = customerId });
                if (overdueCount > 0)
                {
                    return OrderResult.Rejected("ORDER_BLOCKED_OVERDUE_CUSTOMER");
                }
            }

            const string sqlInsertOrder = @"
                INSERT INTO ORDER_CORE.TB_ORDERS (
                    ID_ORDER, ID_CUSTOMER, VL_SUBTOTAL, VL_DESCONTO, VL_FRETE, VL_TOTAL, TP_PAGAMENTO, ST_ORDER, DT_CRIACAO
                ) VALUES (
                    :p_id, :p_customer_id, :p_subtotal, :p_discount, :p_freight, :p_total, :p_payment, 'CONFIRMED', SYSTIMESTAMP
                )";

            var orderId = Guid.NewGuid().ToString("N");
            await _db.ExecuteAsync(sqlInsertOrder, new
            {
                p_id = orderId,
                p_customer_id = customerId,
                p_subtotal = itemsTotal,
                p_discount = discount,
                p_freight = freight,
                p_total = netTotal + freight,
                p_payment = paymentMethod
            });

            return OrderResult.Confirmed(orderId, netTotal, discount, freight);
        }
    }

    public record FreightValidationResult(decimal FreightAmount, bool IsFreeFreight, string Reason)
    {
        public static FreightValidationResult Free(string reason) => new(0m, true, reason);
        public static FreightValidationResult Paid(decimal freightAmount) => new(freightAmount, false, "STANDARD_FREIGHT");
    }

    public record OrderResult(bool Success, string OrderId, string ErrorCode, decimal NetTotal, decimal Discount, decimal Freight)
    {
        public static OrderResult Rejected(string code) => new(false, null, code, 0, 0, 0);
        public static OrderResult Confirmed(string id, decimal net, decimal disc, decimal freight) => new(true, id, null, net, disc, freight);
    }
}
