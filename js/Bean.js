class Status{
  Name = "";
  MaxHP = 0;
  HP = 0;
  Img = "";

  constructor(Name = "", HP = 0, MaxHP = 0, Img = "") {
    this.Name = Name;
    this.HP = HP;
    this.MaxHP = MaxHP;
    this.Img = Img;
  }

  setName(Name) {
    this.Name = Name;
  }

  getName() {
    return this.Name;
  }

  setMaxHP(MaxHP) {
    this.MaxHP = MaxHP;
  }

  getMaxHP() {
    return this.MaxHP;
  }

  setHP(HP) {
    this.HP = HP;
  }

  getHP() {
    return this.HP;
  }

  setImg(Img) {
    this.Img = Img;
  }

  getImg() {
    return this.Img;
  }
}