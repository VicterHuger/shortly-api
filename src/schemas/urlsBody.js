import joi from 'joi';

const urlsBodySchema= joi.object({
    url: joi.string().uri().pattern(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/).required()
});

export {urlsBodySchema};