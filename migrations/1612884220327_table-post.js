/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('post', {
    id: 'id',
    body: { type: 'json', notNull: true },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updatedAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    }
  })
}