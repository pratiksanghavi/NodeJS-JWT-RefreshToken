// Response format

module.exports.successMessage = (success, message, error_code, data) => {
    const successSchema = {
        success: success,
        message: message,
        error_code: error_code,
        data: data,
    };
    return successSchema;
};