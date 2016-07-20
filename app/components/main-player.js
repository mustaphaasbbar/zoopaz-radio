import Ember from 'ember';

export default Ember.Component.extend({
  canary: Ember.computed('album', function(){
    console.log('Feeding the canary ' + this.get('album'));
    return this.get('album');
  }),
});
