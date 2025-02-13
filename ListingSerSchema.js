const Joi = require('joi');

module.exports.listingSerSchema = Joi.object({
    Listing : Joi.object({
       title: Joi.string().required(),
       description: Joi.string().required(),
       country: Joi.string().required(),
       location: Joi.string().required(),
       price: Joi.number().required(),
       url: Joi.string().allow("",null),
    }).required(), 
}); 

module.exports.listingReview = Joi.object({
    Review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),

    }).required(),
});