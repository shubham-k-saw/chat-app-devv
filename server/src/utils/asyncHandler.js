export const asyncHandler = (fun) => {
  return async (req, res, next) => {
    try {
      await fun(req, res, next);
    } catch (error) {
      console.log("Internal error", error);
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };
};

