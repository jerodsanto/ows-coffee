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
    var others = document.getElementsByTagName("audio");

    for (var i = 0; i < others.length; i++) {
      others[i].pause();
      others[i].currentTime = 0.0;
    }

    var audio = document.getElementById(name);

    if (audio) {
      audio.play();
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
      this.boxes[i].onmouseover = function() {
        if (!self.hasClass(this, "selected")) {
          self.addClass(this, "hovered");
          self.playSound("hover-" + this.id);
          ga("send", "face", "hover", this.id);
        }
      }

      this.boxes[i].onmouseout = function() {
        if (!self.hasClass(this, "selected")) {
          self.removeClass(this, "hovered");
        }
      }

      this.boxes[i].onclick = function() {
        window.scrollTo(0,document.body.scrollHeight);

        if (self.hasClass(this, "selected")) {
          if (self.selected > 1) {
            self.removeClass(this, "selected");
            self.removeClass(this, "hovered");
            self.playSound("deselect-" + this.id);
            ga("send", "face", "deselect", this.id);
          }
        } else {
          self.addClass(this, "selected");
          self.playSound("select-" + this.id);
          ga("send", "face", "select", this.id);
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

    this.updateButton();
  }
}
