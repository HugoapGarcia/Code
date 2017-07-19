var Schema = require('mongoose').Schema;

module.exports = {
    name: { type: String, default: 'new dish' },
    code: { type: String, default: '' },
    path: { type: String, default: './img/dishes/' },
    name_image: { type: String, default: '' },
    image: { type: String, default: '' },
    description: { type: String, default: 'Write description here...' },
    price: { type: Number, default: 0 },
    guest: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    taxable: { type: Boolean, default: true },
    'prep time': { type: Number, default: 0 },
    seq: { type: Number, default: 1 },
    connections: {
        courses: [{ type: Schema.Types.ObjectId, ref: 'course' }],
        route: { type: Schema.Types.ObjectId, ref: 'route', default: '57322185e327e7141b37db26' }
    },
    attachedIngredients: [{
        quantity: {type: Number, default: 1},
        'default option': {type: String, default: ''},
        ingredient: { type: Schema.Types.ObjectId, ref: 'ingredient' }
    }],
    attachedSupplies: [{
        quantity: {type: Number, default: 1},
        'default option': {type: String, default: ''},
        supply: { type: Schema.Types.ObjectId, ref: 'supplie' }
    }]
};
