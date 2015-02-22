function enemy(maxHp, attack, defense, atkBehavior, defBehavior, image) {
  this.maxHp = maxHp;
  this.attack = attack;
  this.defense = defense;
  this.atkBehavior = atkBehavior;
  this.defBehavior = defBehavior;
  this.cssClass= ;
  this.currentHp = this.maxHp;
  this.turns = 0;
}

function standardAtkBehavior(playerHp, orbData){
  // returns the total damage.
  // makes any necessary changes to orbs directly

  switch(this.turns % 5){
    case 0:
      return this.attack;
    case 1:
      return this.attack;
    case 2:
      return this.attack;
    case 3:
      return 0;
    case 4:
      return this.attack * 2;
  }

}

function standardDefBehavior(matches){
  var damage = scoreMatches(matches);
  this.currentHp -= damage;

}
