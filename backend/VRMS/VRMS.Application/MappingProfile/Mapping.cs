using AutoMapper;
using VRMS.Application.Dtos;
using VRMS.Domain.Entities;

public class Mapping : Profile
{
    public Mapping()
    {
        CreateMap<Payment, PaymentDto>()
            .ForMember(d => d.IsRefunded, o => o.MapFrom(s => s.IsRefunded))
            .ForMember(d => d.RefundedAt, o => o.MapFrom(s => s.RefundedAt))
            .ForMember(d => d.StripeRefundId, o => o.MapFrom(s => s.StripeRefundId));

        CreateMap<PaymentDto, Payment>()
            .ForMember(d => d.IsRefunded, o => o.MapFrom(s => s.IsRefunded))
            .ForMember(d => d.RefundedAt, o => o.MapFrom(s => s.RefundedAt))
            .ForMember(d => d.StripeRefundId, o => o.MapFrom(s => s.StripeRefundId));

        CreateMap<Receipt, ReceiptDto>();
        CreateMap<ReceiptDto, Receipt>();
    }
}
