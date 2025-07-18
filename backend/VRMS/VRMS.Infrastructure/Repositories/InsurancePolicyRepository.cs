using Microsoft.EntityFrameworkCore;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;
namespace VRMS.Infrastructure.Repositories
{ 
public class InsurancePolicyRepository : IInsurancePolicyRepository
{
    private readonly VRMSDbContext _context;

    public InsurancePolicyRepository(VRMSDbContext context)
    {
        _context = context;
    }

    public async Task AddInsurancePolicy(InsurancePolicy insurancePolicy)
    {
        await _context.InsurancePolicy.AddAsync(insurancePolicy);
        await _context.SaveChangesAsync();
    }

    public async Task<InsurancePolicy> GetInsurancePolicyById(int insurancePolicyId)
    {
        return await _context.InsurancePolicy.AsNoTracking()
            .FirstOrDefaultAsync(ip => ip.InsurancePolicyId == insurancePolicyId);
    }

    public async Task<InsurancePolicy> GetInsurancePolicyByCustomerId(int customerId)
    {
        return await _context.InsurancePolicy
            .FirstOrDefaultAsync(p => p.CustomerId == customerId);
    }
    public async Task UpdateInsurancePolicy(InsurancePolicy insurancePolicy)
    {
        var trackedEntity = await _context.InsurancePolicy
            .FirstOrDefaultAsync(p => p.InsurancePolicyId == insurancePolicy.InsurancePolicyId);

        if (trackedEntity == null)
            throw new InvalidOperationException("Insurance policy not found.");

        // Manually update fields
        trackedEntity.CustomerId = insurancePolicy.CustomerId;
        trackedEntity.PolicyNumber = insurancePolicy.PolicyNumber;
        trackedEntity.EndDate = insurancePolicy.EndDate;
        trackedEntity.CoveragePercentage = insurancePolicy.CoveragePercentage;
        trackedEntity.ProviderName = insurancePolicy.ProviderName;
        trackedEntity.StartDate = insurancePolicy.StartDate;

        await _context.SaveChangesAsync();
    }



    public async Task DeleteInsurancePolicy(int insurancePolicyId)
    {
        var insurancePolicy = await GetInsurancePolicyById(insurancePolicyId);
        if (insurancePolicy != null)
        {
            _context.InsurancePolicy.Remove(insurancePolicy);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<InsurancePolicy>> GetAllInsurancePolicies()
    {
        return await _context.InsurancePolicy.AsNoTracking().ToListAsync();
    }

    // ✅ New method
    public async Task<InsurancePolicy?> GetInsurancePolicyByPolicyNumber(string policyNumber)
    {
        return await _context.InsurancePolicy.AsNoTracking()
            .FirstOrDefaultAsync(ip => ip.PolicyNumber == policyNumber);
    }
}
}