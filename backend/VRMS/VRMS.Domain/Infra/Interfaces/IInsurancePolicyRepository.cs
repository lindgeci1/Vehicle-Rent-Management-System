using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRMS.Domain.Entities;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IInsurancePolicyRepository
    {
        Task<IEnumerable<InsurancePolicy>> GetAllInsurancePolicies();
        Task<InsurancePolicy> GetInsurancePolicyById(int insurancePolicyId);
        Task AddInsurancePolicy(InsurancePolicy insurancePolicy);
        Task UpdateInsurancePolicy(InsurancePolicy insurancePolicy);
        Task DeleteInsurancePolicy(int insurancePolicyId);
        Task<InsurancePolicy?> GetInsurancePolicyByPolicyNumber(string policyNumber);

        Task<InsurancePolicy> GetInsurancePolicyByCustomerId(int customerId);
    }
}
