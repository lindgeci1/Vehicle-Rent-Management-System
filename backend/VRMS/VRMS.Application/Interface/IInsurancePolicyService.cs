using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRMS.Application.Dtos;

namespace VRMS.Application.Interface
{
    public interface IInsurancePolicyService
    {
        Task<IEnumerable<InsurancePolicyDto>> GetAllInsurancePolicies();
        Task<InsurancePolicyDto> GetInsurancePolicyById(int insurancePolicyId);
        Task <InsurancePolicyDto> CreateInsurancePolicy(InsurancePolicyDto insurancePolicyDto);
        Task<InsurancePolicyDto> UpdateInsurancePolicy(InsurancePolicyDto insurancePolicyDto);
        Task DeleteInsurancePolicy(int insurancePolicyId);
        Dictionary<string, double> GetAvailableInsuranceProviders(string providerName);

    }
}
