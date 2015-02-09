function enemy(maxHp, attack, defense, atkBehavior,defBehavior,image) {
  this.maxHp = maxHp;
  this.attack = attack;
  this.defense = defense;
  this.atkBehavior = atkBehavior;
  this.defBehavior = defBehavior;
  this.currentHp = this.maxHp;
  this.turns = 0;
  this.image="cssClass";
}

function atkBehavior(playerHp,orbData){
  // returns the total damage.
  // makes any necessary changes to orbs directly
  //return this.attack;

  switch(this.turns % 5){
    case 0:
      return this.attack;
    case 1:
      return this.attack * 2;
    case 2:
      return this.attack/2;
    case 3:
      return this.attack * 2;
    case 4:
      return this.attack/2;

  }

}

function defBehavior(matches){
  var damage = scoreMatches(matches);
  this.currentHp -= damage;

}
