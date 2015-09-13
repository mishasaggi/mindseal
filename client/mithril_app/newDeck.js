//create a new deck here
var newDeck = {};

newDeck.nameTxt = m.prop();

newDeck.view = function(){

  return m(".container", [
      m(".starter-template", [
        m("h1", "CODENAME: IGGY"),
        m("p.lead", "Let's add a new deck.",
        m("input[type='text'][class='newFront']", {onchange: m.withAttr("value", newDeck.nameTxt)}),
        m("br"),
        m("input[type='button'][value='make a card!']",
          {onclick:this.makeDeck.bind(this)}
          )
      ])
    ])

}

newDeck.makeDeck = function(){ //populates the values of the card from the form and calls the view
  var newDeck = {};

  newDeck.name = this.nameTxt();

  console.log(newDeck.name, " :name of the deck fetched from the dom");

  Card.setCard(Card.vm(newDeck)); //set the deck instead. Change method call.
}

newDeck.controller = function(){


}

