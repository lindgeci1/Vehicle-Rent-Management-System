using System.Net;
using VRMS.Application.Enums;
using VRMS.Application.ErrorModelException;

namespace VRMS.UI.Middleware
{
    public class ExceptionMiddleware(RequestDelegate _next, ILogger<ExceptionMiddleware> _logger)
    {
        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred for user {User} (Path: {Path}, Method: {Method}): {Message}",
                    httpContext.User?.Identity!.Name,
                    httpContext.Request.Path,
                    httpContext.Request.Method,
                    ex.Message);

                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            var errorModel = new ErrorModel();

            switch (exception)
            {
                case BadArgumentException e:
                    errorModel.ErrorCode = e.Code;
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorModel.Message = "Bad argument: " + e.Message;
                    break;

                case AccessForbiddenException e:
                    errorModel.ErrorCode = e.Code;
                    context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                    errorModel.Message = "Access forbidden: " + e.Message;
                    break;

                case NotFoundException e:
                    errorModel.ErrorCode = e.Code;
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorModel.Message = "Not found: " + e.Message;
                    break;

                default:
                    errorModel.ErrorCode = ErrorCode.InternalServerError;
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorModel.Message = "Internal server error: " + exception.Message;
                    break;
            }

            var errorResponse = new
            {
                Error = errorModel
            };

            return context.Response.WriteAsJsonAsync(errorResponse);
        }
    }
}
