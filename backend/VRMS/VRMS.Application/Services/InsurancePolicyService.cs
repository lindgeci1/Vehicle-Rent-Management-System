using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using VRMS.Application.Interface;

namespace VRMS.Application.Services
{
    public class InsurancePolicyService : IInsurancePolicyService
    {
        private readonly IInsurancePolicyRepository _insurancePolicyRepository;
        private readonly ICustomerRepository _customerRepository;

        private readonly Dictionary<string, double> _rentalInsuranceProviders = new()
    {
        { "Scardian", 85.0 },
        { "Siguria", 80.0 },
        { "Elsig", 78.0 },
        { "Dardania", 82.0 },
        { "Illyria", 88.0 }
    };


        public InsurancePolicyService(IInsurancePolicyRepository insurancePolicyRepository, ICustomerRepository customerRepository)
        {
            _insurancePolicyRepository = insurancePolicyRepository;
            _customerRepository = customerRepository;
        }

        public async Task<InsurancePolicyDto> CreateInsurancePolicy(InsurancePolicyDto insurancePolicyDto)
        {
            if (insurancePolicyDto == null)
                throw new ArgumentException("Insurance policy cannot be null.");

            if (string.IsNullOrWhiteSpace(insurancePolicyDto.PolicyNumber))
                throw new ArgumentException("Policy number is required.");

            if (string.IsNullOrWhiteSpace(insurancePolicyDto.PolicyNumber) || insurancePolicyDto.PolicyNumber.Length != 7)
                throw new ArgumentException("Policy number must be exactly 7 characters long.");

            // ✅ New check: prevent multiple policies per customer
            var existingPolicyForCustomer = await _insurancePolicyRepository.GetInsurancePolicyByCustomerId(insurancePolicyDto.CustomerId);
            if (existingPolicyForCustomer != null)
                throw new ArgumentException("This customer already has an insurance policy.");

            var existing = await _insurancePolicyRepository.GetInsurancePolicyByPolicyNumber(insurancePolicyDto.PolicyNumber);
            if (existing != null)
                throw new ArgumentException("Policy number already exists.");

            // ✅ Check if the user is a customer
            var isCustomer = await _customerRepository.CustomerExistsByUserId(insurancePolicyDto.CustomerId);
            if (!isCustomer)
                throw new ArgumentException("Insurance can only be assigned to customers.");

            if (string.IsNullOrWhiteSpace(insurancePolicyDto.ProviderName) ||
                !_rentalInsuranceProviders.ContainsKey(insurancePolicyDto.ProviderName))
                throw new ArgumentException("Invalid insurance provider.");

            var startDate = DateTime.UtcNow;
            var endDate = insurancePolicyDto.EndDate;

            if (startDate >= endDate)
                throw new ArgumentException("End date must be after today.");

            var coverage = _rentalInsuranceProviders[insurancePolicyDto.ProviderName];

            var insurancePolicy = new InsurancePolicy(
                insurancePolicyDto.InsurancePolicyId,
                insurancePolicyDto.CustomerId,
                insurancePolicyDto.PolicyNumber,
                startDate,
                endDate,
                coverage,
                insurancePolicyDto.ProviderName
            );

            await _insurancePolicyRepository.AddInsurancePolicy(insurancePolicy);
            return new InsurancePolicyDto(insurancePolicy);
        }

        // ✅ Update
        public async Task<InsurancePolicyDto> UpdateInsurancePolicy(InsurancePolicyDto insurancePolicyDto)
        {
            if (insurancePolicyDto == null)
                throw new ArgumentException("Insurance policy cannot be null.");

            if (string.IsNullOrWhiteSpace(insurancePolicyDto.PolicyNumber) || insurancePolicyDto.PolicyNumber.Length != 7)
                throw new ArgumentException("Policy number must be exactly 7 characters long.");

            var existingPolicy = await _insurancePolicyRepository.GetInsurancePolicyById(insurancePolicyDto.InsurancePolicyId);
            if (existingPolicy == null)
                throw new ArgumentException("Insurance policy not found.");

            var duplicate = await _insurancePolicyRepository.GetInsurancePolicyByPolicyNumber(insurancePolicyDto.PolicyNumber);
            if (duplicate != null && duplicate.InsurancePolicyId != insurancePolicyDto.InsurancePolicyId)
                throw new ArgumentException("Policy number is already in use by another policy.");

            var existingPolicyForCustomer = await _insurancePolicyRepository.GetInsurancePolicyByCustomerId(insurancePolicyDto.CustomerId);
            if (existingPolicyForCustomer != null && existingPolicyForCustomer.InsurancePolicyId != insurancePolicyDto.InsurancePolicyId)
                throw new ArgumentException("This customer already has another insurance policy.");


            var isCustomer = await _customerRepository.CustomerExistsByUserId(insurancePolicyDto.CustomerId);
            if (!isCustomer)
                throw new ArgumentException("Insurance can only be updated for registered customers.");

            if (string.IsNullOrWhiteSpace(insurancePolicyDto.ProviderName) ||
                !_rentalInsuranceProviders.ContainsKey(insurancePolicyDto.ProviderName))
                throw new ArgumentException("Invalid insurance provider.");

            var startDate = existingPolicy.StartDate;
            var endDate = insurancePolicyDto.EndDate;

            if (startDate >= endDate)
                throw new ArgumentException("End date must be after the start date.");

            var coverage = _rentalInsuranceProviders[insurancePolicyDto.ProviderName];

            var updatedPolicy = new InsurancePolicy(
                existingPolicy.InsurancePolicyId,
                insurancePolicyDto.CustomerId,
                insurancePolicyDto.PolicyNumber,
                startDate,
                endDate,
                coverage,
                insurancePolicyDto.ProviderName
            );

            await _insurancePolicyRepository.UpdateInsurancePolicy(updatedPolicy);
            return new InsurancePolicyDto(updatedPolicy);
        }

        // ✅ Get by ID
        public async Task<InsurancePolicyDto> GetInsurancePolicyById(int insurancePolicyId)
        {
            var insurancePolicy = await _insurancePolicyRepository.GetInsurancePolicyById(insurancePolicyId);
            return insurancePolicy != null ? new InsurancePolicyDto(insurancePolicy) : null;
        }

        // ✅ Delete
        public async Task DeleteInsurancePolicy(int insurancePolicyId)
        {
            var existingPolicy = await _insurancePolicyRepository.GetInsurancePolicyById(insurancePolicyId);
            if (existingPolicy == null)
                throw new ArgumentException("Insurance policy not found.");

            await _insurancePolicyRepository.DeleteInsurancePolicy(insurancePolicyId);
        }

        // ✅ Get all
        public async Task<IEnumerable<InsurancePolicyDto>> GetAllInsurancePolicies()
        {
            var insurancePolicyList = await _insurancePolicyRepository.GetAllInsurancePolicies();
            return insurancePolicyList.Select(p => new InsurancePolicyDto(p));
        }

        public Dictionary<string, double> GetAvailableInsuranceProviders(string providerName)
        {
            var match = _rentalInsuranceProviders
                .Where(p => string.Equals(p.Key, providerName, StringComparison.OrdinalIgnoreCase))
                .ToDictionary(p => p.Key, p => p.Value);

            return match;
        }
    }
}
