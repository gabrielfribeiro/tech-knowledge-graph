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
    }
}
