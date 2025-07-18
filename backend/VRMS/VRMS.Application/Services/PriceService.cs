namespace VRMS.Application.Services
{
    public class PriceService
    {
        public decimal CalculatePrepayFee(string vehicleType, string mark, int year)
        {
            decimal baseFee = vehicleType switch
            {
                "Car" => 10,
                "Motorcycle" => 10,
                "Bus" => 10,
                _ => 10
            };

            decimal multiplier = vehicleType switch
            {
                "Car" => mark switch
                {
                    "Audi" => 1.2m,
                    "BMW" => 1.3m,
                    "Mercedes" => 1.4m,
                    "Honda" => 1.0m,
                    "Toyota" => 1.1m,
                    "Ford" => 1.0m,
                    _ => 1.0m
                },
                "Motorcycle" => mark switch
                {
                    "Harley-Davidson" => 1.5m,
                    "Yamaha" => 1.3m,
                    "Kawasaki" => 1.2m,
                    "Honda" => 1.0m,
                    "Suzuki" => 1.1m,
                    "Ducati" => 1.6m,
                    _ => 1.0m
                },
                "Bus" => mark switch
                {
                    "Volvo" => 1.4m,
                    "Mercedes" => 1.3m,
                    "Scania" => 1.5m,
                    "MAN" => 1.2m,
                    _ => 1.0m
                },
                _ => 1.0m
            };

            int currentYear = DateTime.Now.Year;
            int age = year > 0 ? currentYear - year : 0;

            decimal fee = baseFee * multiplier - (age * 0.2m);
            if (fee < baseFee)
                fee = baseFee;

            return Math.Round(fee, 2);
        }

        public decimal CalculateDailyPayment(string vehicleType, string mark, int year)
        {
            decimal baseRate = vehicleType switch
            {
                "Car" => 50,
                "Motorcycle" => 40,
                "Bus" => 90,
                _ => 60
            };

            decimal multiplier = vehicleType switch
            {
                "Car" => mark switch
                {
                    "Audi" => 1.4m,
                    "BMW" => 1.5m,
                    "Mercedes" => 1.6m,
                    "Honda" => 1.2m,
                    "Toyota" => 1.25m,
                    "Ford" => 1.1m,
                    _ => 1.0m
                },
                "Motorcycle" => mark switch
                {
                    "Harley-Davidson" => 1.6m,
                    "Yamaha" => 1.4m,
                    "Kawasaki" => 1.3m,
                    "Honda" => 1.1m,
                    "Suzuki" => 1.2m,
                    "Ducati" => 1.7m,
                    _ => 1.0m
                },
                "Bus" => mark switch
                {
                    "Volvo" => 1.5m,
                    "Mercedes" => 1.4m,
                    "Scania" => 1.6m,
                    "MAN" => 1.3m,
                    _ => 1.0m
                },
                _ => 1.0m
            };

            int currentYear = DateTime.Now.Year;
            int age = year > 0 ? currentYear - year : 0;

            decimal rate = baseRate * multiplier - (age * 0.75m);
            return rate < baseRate ? baseRate : Math.Round(rate, 2);
        }


    }
}