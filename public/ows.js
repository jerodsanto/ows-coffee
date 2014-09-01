(function(fn){
    if (!fn.map) fn.map=function(f){var r=[];for(var i=0;i<this.length;i++)r.push(f(this[i]));return r}
    if (!fn.filter) fn.filter=function(f){var r=[];for(var i=0;i<this.length;i++)if(f(this[i]))r.push(this[i]);return r}
})(Array.prototype);

this.OWS = {
  hasClass: function(element, className) {
    return (" " + element.className + " ").indexOf(" " + className + " ") > -1;
  },

  addClass: function(element, className) {
    element.className = element.className + " " + className;
  },

  removeClass: function(element, className) {
    if (this.hasClass(element, className)) {
      var regexp = new RegExp("(\\s|^)" + className + "(\\s|$)");
      element.className = element.className.replace(regexp , "");
    }
  },

  charge: function(token) {
    var params = "token=" + token.id + "&amount=" + OWS.totalCents;
    var request = new XMLHttpRequest();

    request.open("POST", "/charge", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        OWS.didCharge(request.responseText);
      }
    }

    request.send(params);
  },

  didCharge: function(response) {
    document.getElementById("main").style.display = "none";
    document.getElementById("thanks").style.display = "block";
  },

  updateSelected: function() {
    this.selected = document.getElementsByClassName("selected").length;
    this.totalDollars = this.selected * 5;
    this.totalCents = this.totalDollars * 100;
  },

  updateButton: function() {
    var self = this;

    this.updateSelected();
    this.selectedDollars.innerHTML = "$" + this.totalDollars;
    this.selectedCount.innerHTML = this.selected;

    this.addClass(this.button, "pulse");
    setTimeout(function() {
      self.removeClass(self.button, "pulse");
    }, 1000);
  },

  playSound: function(name) {
    var audio = document.getElementById(name);
    if (audio) {
      audio.play();
    } else {
      var audio = document.createElement("audio");
      audio.id = name;
      audio.autoplay = "autoplay";
      audio.innerHTML = "<source src='audio/"+name+".mp3'><source src='audio/"+name+".ogg'>";
      document.body.appendChild(audio);
    }
  },

  init: function(stripeKey) {
    var self = this;
    var i = 0, j = 0;

    this.stripe = StripeCheckout.configure({
      key: stripeKey,
      image: "images/logo.png",
      token: this.charge
    })

    this.selectedCount = document.getElementById("selected-count");
    this.selectedDollars = document.getElementById("selected-dollars");
    this.fancies = document.getElementsByClassName("fancy-text");

    for (i = 0; i < this.fancies.length; i++) {
      var letters = this.fancies[i].innerHTML.split("");

      this.fancies[i].innerHTML = letters.map(function(letter) {
        ++j;
        return "<span class='char"+j+"'>"+letter+"</span>";
      }).join("");
    }

    this.boxes = document.getElementsByClassName("box");
    this.button = document.getElementById("coffee");

    for (i = 0; i < this.boxes.length; i++) {
      var box = this.boxes[i];

      box.onmouseover = function() {
        if (!self.hasClass(this, "selected")) {
          self.addClass(this, "hovered");
          ga("send", "face", "hover", box.id);
        }
      }

      box.onmouseout = function() {
        if (!self.hasClass(this, "selected")) {
          self.removeClass(this, "hovered");
        }
      }

      box.onclick = function() {
        if (self.hasClass(this, "selected")) {
          if (self.selected > 1) {
            self.removeClass(this, "selected");
            self.removeClass(this, "hovered");
            ga("send", "face", "deselect", box.id);
          }
        } else {
          self.addClass(this, "selected");
          ga("send", "face", "select", box.id);
        }

        self.updateButton();
      }
    }

    this.button.onclick = function(event) {
      self.updateSelected();

      self.stripe.open({
        name: "Out with Sprout",
        description: "Coffee For " + self.selected + " ($" + self.totalDollars + ")",
        amount: self.totalCents,
        panelLabel: "Send {{amount}}"
      })
    }

    // initialize a randomly selected box
    this.addClass(this.boxes[Math.floor(Math.random() * 3)], "selected");

    // scroll to bottom after a second, to ensure buy button is seen
    setTimeout(function() {
      window.scrollTo(0,document.body.scrollHeight);
    }, 1500);

    this.updateButton();
  }
}
