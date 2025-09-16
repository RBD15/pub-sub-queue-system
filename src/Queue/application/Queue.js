class Queue {
  
  #id
  #name
  #items
  constructor(id,name){
    this.#id = id
    this.#items = []
    this.#name = name
  }

  getId(){
    return this.#id
  }

  setItems(item){
    this.#items.push(item)
  }

  getItems(){
    return this.#items
  }

  shiftLastItem(){
    this.#items.shift()
  }

}

module.exports = Queue