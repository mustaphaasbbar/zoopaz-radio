import DS from 'ember-data';

const { attr } = DS;

export default DS.Model.extend({
    userid: attr('number'),
    album: attr('string')
});
