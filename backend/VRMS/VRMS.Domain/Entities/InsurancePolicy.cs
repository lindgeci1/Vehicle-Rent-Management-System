using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class InsurancePolicy
    {
        public InsurancePolicy(int insurancePolicyId, int customerId, string policyNumber, DateTime startDate, DateTime endDate, double coveragePercentage, string? providerName)
        {
            InsurancePolicyId = insurancePolicyId;
            CustomerId = customerId;
            PolicyNumber = policyNumber;
            StartDate = startDate;
            EndDate = endDate;
            CoveragePercentage = coveragePercentage;
            ProviderName = providerName;
        }

        public int InsurancePolicyId { get; set; }
        public int CustomerId { get; set; } // ✅ FK linking to Customer, NOT User
        public string PolicyNumber { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double CoveragePercentage { get; set; }
        public string? ProviderName { get; set; }

        // ✅ Navigation Property (Corrected)
        public Customer Customer { get; set; } = null!;
    }


}
