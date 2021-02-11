/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.addColumns('post', {
    published: { type: 'boolean', notNull: true, default: false },
  })
};

