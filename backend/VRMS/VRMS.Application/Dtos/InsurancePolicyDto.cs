using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRMS.Domain.Entities;

namespace VRMS.Application.Dtos
{
    public class InsurancePolicyDto
    {

        public InsurancePolicyDto() { }

        public InsurancePolicyDto(InsurancePolicy insurancePolicy)
        {
            InsurancePolicyId = insurancePolicy.InsurancePolicyId;
            CustomerId = insurancePolicy.CustomerId;
            PolicyNumber = insurancePolicy.PolicyNumber;
            StartDate = insurancePolicy.StartDate;
            EndDate = insurancePolicy.EndDate;
            CoveragePercentage = insurancePolicy.CoveragePercentage;
            ProviderName = insurancePolicy.ProviderName;
        }

        public int InsurancePolicyId { get; set; }
        public int CustomerId { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double CoveragePercentage { get; set; }
        public string? ProviderName { get; set; }
    }
}
