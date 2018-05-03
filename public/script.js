(function() {
  var loggedIn = false;
  var username = "";
  var query = "";
  var modalOpen = false;
  var loading = false;
  var dom = getDomElements();

  checkLoggedIn();

  function checkLoggedIn() {
    loggedIn = !!dom.placesDiv.getAttribute("data-loggedin");
    username = dom.placesDiv.getAttribute("data-username");

    toggleNavState();
    setupEvents();
  }

  function setupEvents() {
    dom.searchBtn.addEventListener("click", getPlaces);
    dom.placesDiv.addEventListener("click", handlePlacesClick);
    dom.loginBtn.addEventListener("click", handleLoginRegisterClick);
    dom.registerBtn.addEventListener("click", handleLoginRegisterClick);
    dom.logoutBtn.addEventListener("click", handleLogoutClick);
    dom.modal.addEventListener("click", handleModalClick);
    dom.modalBtn.addEventListener("click", loginRegUser);
    dom.modalOption.addEventListener("click", handleModalOptionClick);
  }

  function loginRegUser() {
    var credentials = {
      username: document.querySelector("#username").value,
      password: document.querySelector("#password").value
    };
    dom.modalMessage.className = "modal-info";

    var route = dom.modalTitle.innerHTML === "Login" ? "/login" : "/register";

    if(route === "/register") {
      if (!validateCredentials(credentials.username, credentials.password)) {
        return;
      }
    }

    axios.post(route, credentials)
      .then(function(res) {
        getPlaces();
      })
      .catch(function(err) {
        if(route = "/login") {
          dom.modalMessage.innerHTML = "Incorrect username or password";
          dom.modalMessage.className = "modal-info info-visible";
        } else {
          dom.modalMessage.innerHTML = "Error: Please try again later";
          dom.modalMessage.className = "modal-info info-visible";
        }
      });
  }

  function validateCredentials(username, password) {
    if(username.length <= 3) {
      dom.modalMessage.innerHTML = "Username must be 3 or more characters";
      dom.modalMessage.className = "modal-info info-visible";
      return false;
    } else if(username.length > 10) {
      dom.modalMessage.innerHTML = "Username must be 10 characters or less";
      dom.modalMessage.className = "modal-info info-visible";
    }
    if(password.length <= 5) {
      dom.modalMessage.innerHTML = "Password must be 3 or more characters";
      dom.modalMessage.className = "modal-info info-visible";
      return false;
    }
    return true;
  }

  function handleModalOptionClick(e) {
    switchModal(e.target.innerHTML === "Login");
  }

  function handleLogoutClick() {
    axios.get("/logout")
      .then(function(res) {
        getPlaces();
      })
      .catch(function(err) {
        console.log("Error logging out");
      });
  }

  function toggleNavState() {
    if(loggedIn) {
      dom.loginBtn.className = "nav-item";
      dom.registerBtn.className = "nav-item";
      dom.logoutBtn.className = "nav-item nav-visible";
      dom.loggedInSpan.className = "logged-in nav-visible";
      dom.loggedInSpan.innerHTML = "Welcome, " + capitalize(username);
    } else {
      dom.loginBtn.className = "nav-item nav-visible";
      dom.registerBtn.className = "nav-item nav-visible";
      dom.logoutBtn.className = "nav-item";
      dom.loggedInSpan.className = "logged-in";
      dom.loggedInSpan.innerHTML = "";
    }
  }

  function capitalize(str) {
    return str[0].toUpperCase() + str.substring(1);
  }

  function handleModalClick(e) {
    if (e.target === dom.modal && !loading) {
      closeModal();
    }
  }

  function closeModal() {
    dom.modal.className = "modal";
    modalOpen = false;
    
    clearUsernamePassword();
  }

  function clearUsernamePassword() {
    document.querySelector("#username").value = "";
    document.querySelector("#password").value = "";
  }

  function handleLoginRegisterClick() {
    switchModal(this.innerHTML === "Login");
  
    dom.modal.className = "modal modal-visible";
    modalOpen = true;
  }

  function switchModal(login) {
    var mainText = "";
    var optionText = "";

    if(login) {
      mainText = "Login";
      optionText = "Register";
    } else {
      mainText = "Register";
      optionText = "Login";
    }

    clearUsernamePassword();
    dom.modalMessage.className = "modal-info";
    dom.modalTitle.innerHTML = mainText;
    dom.modalBtn.innerHTML = mainText;
    dom.modalOption.innerHTML = optionText;
  }

  function getPlaces() {
    query = dom.searchInput.value;
    dom.searchBtn.disabled = true;
    loading = true;
    axios.get("/places?location=" + query)
      .then(createPlaces)
      .catch(function (err) {
        console.log("Error retreiving places");
      })
      .finally(function() {
        loading = false;
        if(modalOpen) {
          closeModal();
        }
        toggleGreeting();
        toggleNavState();
      });
  }

  function toggleGreeting() {
    if (!dom.placesDiv.childElementCount) {
      dom.greetingDiv.className = "greeting greeting-visible";
    } else {
      dom.greetingDiv.className = "greeting";
    }
  }

  function handlePlacesClick(e) {
    var btn = e.target;
    if (btn.className !== "attend-btn" && btn.className !== "attend-btn red") {
      return;
    }

    var id = btn.getAttribute("id");
    var placeId = btn.getAttribute("data-place-id");
    var going = btn.innerHTML === "Cancel";
    var contentDiv = btn.previousElementSibling;
    var span = contentDiv.lastElementChild;

    if (!loggedIn) {
      switchModal(true);
      dom.modal.className = "modal modal-visible";
      modalOpen = true;
      return;
    }

    axios.post("/places", { yelpId: id, placeId: placeId, going: going })
      .then(function (res) {
        if (!res.data._id) {
          return;
        }
        going = !going;
        btn.setAttribute("data-place-id", res.data._id);
        btn.className = going ? "attend-btn red" : "attend-btn";
        btn.innerHTML = going ? "Cancel" : "Attend";
        span.innerHTML = getGoingText(res.data.going.length, going);
      })
      .catch(function (err) {
        console.log("Error saving place");
      });
  }

  function createPlaces(res) {
    var places = res.data.places;
    loggedIn = res.data.loggedIn;
    username = res.data.username;
    dom.placesDiv.innerHTML = "";

    if(!places) {
      return;
    }

    var fragment = document.createDocumentFragment();

    places.forEach(function (place) {
      var div = document.createElement("div");
      div.className = "place-box";

      div.appendChild(createImage(place.image));

      var contentDiv = document.createElement("div");
      contentDiv.className = "place-content";

      contentDiv.appendChild(createTitle(place.url, place.name));
      contentDiv.appendChild(createStarsDiv(place.rating));
      contentDiv.appendChild(createRatingSpan(place.review_count));
      contentDiv.appendChild(document.createElement("hr"));
      contentDiv.appendChild(createGoingP(place.count, place.going));

      div.appendChild(contentDiv);
      div.appendChild(createButton(place.id, place.place_id, place.going));

      fragment.appendChild(div);
    });

    dom.placesDiv.appendChild(fragment);

    dom.searchBtn.disabled = false;
  }

  function createImage(image) {
    var img = document.createElement("img");
    img.className = "preview-img";
    var imgUrl = image ? image : "https://place-hold.it/350x200?text=NO+IMAGE&fontsize=14";
    img.setAttribute("src", imgUrl);

    return img;
  }

  function createTitle(url, name) {
    var titleLink = document.createElement("a");
    titleLink.setAttribute("href", url);

    var h3 = document.createElement("h3");
    h3.innerHTML = name;

    titleLink.appendChild(h3);

    return titleLink;
  }

  function createStarsDiv(rating) {
    var starDiv = document.createElement("div");
    starDiv.className = "stars-group";

    var numFullStars = parseInt(rating);
    var hasHalfStar = rating % 1 !== 0;

    for (var i = 0; i < numFullStars; i++) {
      var fullStar = document.createElement("span");
      fullStar.className = "star";
      fullStar.innerHTML = "&#9733;"
      starDiv.appendChild(fullStar);
    }

    if (hasHalfStar) {
      var halfStar = document.createElement("span");
      fullStar.className = "star half";
      fullStar.innerHTML = "&#9733;"
      starDiv.appendChild(halfStar);
    }

    return starDiv;
  }

  function createRatingSpan(review_count) {
    var ratingSpan = document.createElement("span");
    ratingSpan.className = "rating";
    ratingSpan.innerHTML = "(" + review_count + " reviews)";
    
    return ratingSpan;
  }

  function createGoingP(count, going) {
    var goingP = document.createElement("p");
    goingP.className = "going";
    goingP.innerHTML = getGoingText(count, going);

    return goingP;
  }

  function getGoingText(num, isGoing) {
    if(isGoing) {
      if (num === 1) {
        return "You are going";
      } else if (num === 2) {
        return "You and 1 other are going";
      } else {
        return "You and " + (num - 1) + " others are going";
      }
    } else {
      if (num === 0) {
        return "No one going yet";
      } else if (num === 1) {
        return "1 person is going";
      } else {
        return num + " people are going";
      }
    }
  }

  function createButton(id, place_id, going) {
    var btn = document.createElement("button");
    btn.className = going ? "attend-btn red" : "attend-btn";
    btn.setAttribute("id", id);
    btn.setAttribute("data-place-id", place_id);
    btn.innerHTML = going ? "Cancel" : "Attend";

    return btn;
  }

  function getDomElements() {
    return {
      searchBtn: document.querySelector(".search-btn"),
      searchInput: document.querySelector(".search-input"),
      placesDiv: document.querySelector("#places"),
      loginBtn: document.querySelector("#login"),
      registerBtn: document.querySelector("#register"),
      logoutBtn: document.querySelector("#logout"),
      loggedInSpan: document.querySelector(".logged-in"),
      modal: document.querySelector(".modal"),
      modalTitle: document.querySelector(".modal-title"),
      modalBtn: document.querySelector(".modal-btn"),
      modalOption: document.querySelector(".modal-option"),
      modalMessage: document.querySelector(".modal-info"),
      greetingDiv: document.querySelector(".greeting")
    };
  }
})();