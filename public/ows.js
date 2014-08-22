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
    this.updateSelected();
    document.getElementById("selected-count").innerHTML = this.selected;
    document.getElementById("selected-dollars").innerHTML = "$" + this.totalDollars;
  },

  init: function(stripeKey) {
    var self = this;

    this.stripe = StripeCheckout.configure({
      key: stripeKey,
      image: "logo.png",
      token: this.charge
    })

    this.boxes = document.getElementsByClassName("box");
    this.button = document.getElementById("coffee");

    for (var i = 0; i < this.boxes.length; i++) {
      this.boxes[i].onmouseover = function() {
        if (!self.hasClass(this, "selected")) {
          self.addClass(this, "hovered");
        }
      }

      this.boxes[i].onmouseout = function() {
        if (!self.hasClass(this, "selected")) {
          self.removeClass(this, "hovered");
        }
      }

      this.boxes[i].onclick = function() {
        if (self.hasClass(this, "selected")) {
          if (self.selected > 1) {
            self.removeClass(this, "selected");
          }
        } else {
          self.addClass(this, "selected");
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

    this.updateButton();
  }
}
