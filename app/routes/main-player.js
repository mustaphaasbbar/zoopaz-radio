import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    console.log('ok:yes');
    return { "ok": "yes" };
  }
});
