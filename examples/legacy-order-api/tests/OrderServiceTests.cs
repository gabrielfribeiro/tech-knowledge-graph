using System.Data;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using LegacyOrderApi.Services;

namespace LegacyOrderApi.Tests
{
    public class OrderServiceTests
    {
        [Fact]
        public async Task Should_Apply_12Percent_Discount_And_Free_Freight_When_Total_Above_500()
        {
            var dbMock = new Mock<IDbConnection>();
            var sut = new OrderService(dbMock.Object);

            var result = await sut.CalculateAndCreateOrderAsync("CUST-01", "GOLD", 1000m, 10, "PIX");

            result.Discount.Should().Be(120m);
            result.Freight.Should().Be(0m);
            result.NetTotal.Should().Be(880m);
        }

        [Fact]
        public void Should_Apply_Free_Freight_For_Vip_Customer()
        {
            var dbMock = new Mock<IDbConnection>();
            var sut = new OrderService(dbMock.Object);

            var result = sut.ValidateFreight("DIAMOND", 120m);

            result.IsFreeFreight.Should().BeTrue();
            result.FreightAmount.Should().Be(0m);
            result.Reason.Should().Be("FREIGHT_VIP_RULE");
        }

        [Fact]
        public void Should_Apply_Standard_Freight_For_Regular_Customer()
        {
            var dbMock = new Mock<IDbConnection>();
            var sut = new OrderService(dbMock.Object);

            var result = sut.ValidateFreight("GOLD", 120m);

            result.IsFreeFreight.Should().BeFalse();
            result.FreightAmount.Should().Be(39.90m);
            result.Reason.Should().Be("STANDARD_FREIGHT");
        }
    }
}
