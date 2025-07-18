using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Application.Dtos
{
    public class LogoutDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
