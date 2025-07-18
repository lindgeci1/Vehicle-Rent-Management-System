using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Application.Dtos
{
    public sealed record CreatePaymentIntentRequestDto
    {
        public int ReservationId { get; init; }
        public decimal Amount { get; init; } // in cents
        public string Description { get; init; }
    }
}