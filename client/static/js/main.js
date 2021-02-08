(() => {
  const app = {
    initialize() {
      moment.locale('nl-be');
      this.tinderApi = new TinderApi();
      this.users = null;
      this.matches = null;
      this.currentUserId = null;
      this.currentFriendId = null;
      this.cacheElements();
      this.registerListeners();
      this.fetchUsers();
      this.fetchMatches();
    },
    cacheElements() {
      // Cache UI elements to be used in the DOM
      this.$usersList = document.querySelector('.users__list');
      this.$messagesInbox = document.querySelector('.inbox__list');
      this.$messagesOutbox = document.querySelector('.outbox__list');
      this.$chatHeaderName = document.querySelector('.messages__chat .friend__name');
      this.$chatList = document.querySelector('.chat__list');
      this.$createMsgForm = document.querySelector('.create-msg');
      this.$matchesList = document.querySelector('.match__list');
      this.$noMatchesList = document.querySelector('.no-match__list');
      this.$tooltip = document.querySelector('.tooltip');
      this.$showUsersButton = document.querySelector('#show-users');
      this.$userNames = document.querySelector('.user__names');
    },
    registerListeners() {
      // Adds a click event for users in the list
      this.$usersList.addEventListener('click', (e) => {
        const userId = e.target.dataset.id || e.target.parentNode.dataset.id || e.target.parentNode.parentNode.dataset.id;
        this.setActiveUser(userId);
      });
      // Adds a click event for users in the inbox list
      this.$messagesInbox.addEventListener('click', (e) => {
        const userId = e.target.dataset.receiverId || e.target.parentNode.dataset.receiverId || e.target.parentNode.parentNode.dataset.receiverId;
        const friendId = e.target.dataset.senderId || e.target.parentNode.dataset.senderId || e.target.parentNode.parentNode.dataset.senderId;
        this.setActiveFriend(userId, friendId);
      });
      // Adds a click event for users in the outbox list
      this.$messagesOutbox.addEventListener('click', (e) => {
        const userId = e.target.dataset.receiverId || e.target.parentNode.dataset.receiverId || e.target.parentNode.parentNode.dataset.receiverId;
        const friendId = e.target.dataset.senderId || e.target.parentNode.dataset.senderId || e.target.parentNode.parentNode.dataset.senderId;
        this.setActiveFriend(friendId, userId);
        this.hideUsersSelect();
      });
      this.$createMsgForm.addEventListener('submit',
        async (e) => {
          e.preventDefault();
          const message = e.target['msg__text'].value;
          e.target['msg__text'].value = '';

          await this.tinderApi.addMessageBetweenUsers(this.currentUserId, this.currentFriendId, message);

          this.fetchConversationFromUserAndFriend(this.currentUserId, this.currentFriendId);
      });
      this.$showUsersButton.addEventListener('click', async () => this.showUsersSelect());

      this.$userNames.addEventListener('click', (e) => {
        const friendId = e.target.dataset.id;
        this.hideUsersSelect();
        this.setActiveFriend(this.currentUserId, friendId);
      });
    },

    /*
    Gets all users and stores them in the app
    Populates the user list
    Creates a current user
    */
    async fetchUsers() {
      this.users = await this.tinderApi.getUsers();
      this.$usersList.innerHTML = this.users.map((u) => {
        return `
        <li class="users__list-item">
          <a href="#" data-id="${u.id}">
            <img src="${u.picture.thumbnail}" alt="${u.username}'s avatar">
            <span class="name">${u.firstName} ${u.lastName}</span>
          </a>
        </li>`
      }).join('');
      const userId = this.users[0].id;
      // If there is already a current used in session storage, set that user as the active user
      if (localStorage.currentUserId === undefined) {
        this.setActiveUser(userId);
        // Otherwise set the first user in the list as the active user
      } else {
        this.setActiveUser(localStorage.currentUserId);
      };
    },

    /*
    Stores the current user in the app and session storage
    Gets all messages and matches to and from the user
    */
    setActiveUser(userId) {
      // Store the current user in the app
      this.currentUserId = userId;
      // Keep the current user in session storage
      localStorage.currentUserId = userId;
      const $selectedUser = this.$usersList.querySelector(`.users__list-item.selected`);
      if ($selectedUser !== null) {
        $selectedUser.classList.remove('selected');
      }
      this.$usersList.querySelector(`.users__list-item > a[data-id="${userId}"]`).parentNode.classList.add('selected');
      this.fetchMessagesToUser(userId);
      this.fetchMessagesFromUser(userId);
      this.fetchMatchesFromUser(userId);
    },

    /*
    Stores the current friend in the app
    Adds selected class to the current friend in the list
    */
    setActiveFriend(userId, friendId) {
      this.currentFriendId = friendId;
      const allInbox = this.$messagesInbox.querySelectorAll('.inbox__list-item > a');
      const allOutbox = this.$messagesOutbox.querySelectorAll('.outbox__list-item > a');

      for (let inbox of allInbox) {
        if (inbox.dataset.senderId === friendId) {
          inbox.parentNode.classList.add('selected');
        } else {
          if (inbox.parentNode.classList.contains('selected')) {
            inbox.parentNode.classList.remove('selected');
          }
        }
      };
      for (let outbox of allOutbox) {
        if (outbox.dataset.receiverId === friendId) {
          outbox.parentNode.classList.add('selected');
        } else {
          if (outbox.parentNode.classList.contains('selected')) {
            outbox.parentNode.classList.remove('selected');
          }
        }
      };

      this.fetchConversationFromUserAndFriend(userId, friendId);
    },

    /*
    Gets all incoming messages to user, displays only the last sent message from a unique user in the list
    */
    async fetchMessagesToUser(userId) {
      const messagesIn = await this.tinderApi.getReceivedMessagesFromUser(userId);

      // Create an array of unique senders
      const senders = [...new Set(messagesIn.map(s => s.senderId))];

      let messageFromSenders = [];

      // Keep only the last created message to display in the DOM
      for (sender of senders) {
        let messageFromSender = messagesIn.filter(m => m.senderId === sender);
        messageFromSender.length = 1;
        messageFromSenders.push(messageFromSender);
      };

      this.senderIds = [];

      this.$messagesInbox.innerHTML = messageFromSenders.map((m) => {
        const createdDateString = moment(m[0].createdAt).fromNow();
        const senderId = this.users.find(u => m[0].senderId === u.id);
        const senderName = `${senderId.firstName} ${senderId.lastName}`;
        this.senderIds.push(senderId.id);
        return `
        <li class="inbox__list-item">
          <a href="#" data-msg-id="${m[0].id}" data-sender-id="${m[0].senderId}" data-receiver-id="${m[0].receiverId}">
            <span class="message__sender">${senderName}</span>
            <p class="message__content">${m[0].message}</p>
            <span class="message__time">${createdDateString}</span>
          </a>
        </li>`
      }).join('');
    },

    /*
    Gets all outgoing messages from user, displays only the last sent message to a unique user in the list
    */
    async fetchMessagesFromUser(userId) {
      const messagesOut = await this.tinderApi.getSentMessagesFromUser(userId);

      // Create an array of unique receivers
      const receivers = [...new Set(messagesOut.map(s => s.receiverId))];

      let messageFromReceivers = [];

      // Keep only the last created message to display in the DOM
      for (receiver of receivers) {
        let messageFromReceiver = messagesOut.filter(m => m.receiverId === receiver);
        messageFromReceiver.length = 1;
        messageFromReceivers.push(messageFromReceiver);
      };

      this.receiverIds = [];
      this.$messagesOutbox.innerHTML = messageFromReceivers.map((m) => {
        const createdDateString = moment(m[0].createdAt).fromNow();
        const receiverId = this.users.find(u => m[0].receiverId === u.id);
        const receiverName = `${receiverId.firstName} ${receiverId.lastName}`;

        this.receiverIds.push(receiverId.id);
        return `
        <li class="outbox__list-item">
          <a href="#" data-id="${m[0].id}" data-sender-id="${m[0].senderId}" data-receiver-id="${m[0].receiverId}">
            <span class="message__receiver">${receiverName}</span>
            <p class="message__content">${m[0].message}</p>
            <span class="message__time">${createdDateString}</span>
          </a>
        </li>`
      }).join('');
      this.setActiveFriend(userId, this.receiverIds[0]);
    },

    /*
    Gets the conversation between the current user and friend
    */
    async fetchConversationFromUserAndFriend(userId, friendId) {
      const conversation = await this.tinderApi.getConversationBetweenUsers(userId, friendId);
      const user = this.users.find(u => u.id === userId);
      const friend = this.users.find(u => u.id === friendId);
      this.$chatHeaderName.innerHTML = `${friend.firstName} ${friend.lastName}`;
      // Sorts the conversation to show the last sent message at the bottom
      conversation.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
        if (a.createdAt < b.createdAt) {
          return 1;
        }
        return 0;
      });
      
      this.$chatList.innerHTML = conversation.map((m) => {
        const createdDateString = moment(m.createdAt).fromNow();
        if (m.senderId === userId) {
          html = `
            <li class="msg msg-out" data-id="${m.id}">
              <div class="msg__info">
                <p class="msg__created">${createdDateString}</p>  

                <img src="${user.picture.thumbnail}" alt="${user.firstName} ${user.lastName}">
              </div>

              <p class="msg__body">${m.message}</p>

              <button class="btn-delete" data-id="${m.id}"><i class="fas fa-trash-alt" title="Delete this message"></i></button>
            </li>`;
          return html;
        } else {
          return `
            <li class="msg msg-in" data-id="${m.id}" data-created="${m.createdAt}">
              <div class="msg__info">
                <p class="msg__created">${createdDateString}</p>  
              
                <img src="${friend.picture.thumbnail}" alt="${friend.firstName} ${friend.lastName}">
              </div>
              
              <p class="msg__body">${m.message}</p>
            </li>`;
        }
      }).join('');
      this.registerListenerForButtons();
    },
    async showUsersSelect() {
      this.$userNames.innerHTML = await this.users.filter(u => u.id !== this.currentUserId && u.id !== this.currentFriendId).map(u => `
        <li class="u-name" data-id="${u.id}">${u.firstName} ${u.lastName}</li>
      `).join('');
      this.$userNames.classList.toggle('visible');
    },
    hideUsersSelect() {
      this.$userNames.classList.remove('visible');
    },
    registerListenerForButtons() {
      const $deleteButtons = document.querySelectorAll('.btn-delete');
      $deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const messageId = e.target.dataset.id || e.target.parentNode.dataset.id;
          this.tinderApi.deleteMessage(messageId);
        })
      });
      
    },
    getGenderIconHTML(gender) {
      if (gender === 'female') {
        return `<i class="fas fa-venus"></i>`;
      } else if (gender === 'male') {
        return `<i class="fas fa-mars"></i>`;
      } else {
        // Because there are more than two genders in 2021
        return `<i class="fas fa-genderless"></i>`;
      }
    },
    /*
    Gets all the matches for the current user
    */
    async fetchMatchesFromUser(userId) {
      const matchesOut = await this.tinderApi.getMatchesForUser(userId);
      const matchesIn = this.matches.filter(m => m.friendId === userId);
      const matchesBoth = [];
      matchesIn.forEach(mIn => {
        matchesOut.forEach(mOut => {
          if (mOut.friendId === mIn.userId) {
            matchesBoth.push({
              matchIn: mIn,
              matchOut: mOut
            });
            matchesIn.splice(mIn.indexOf, 1);
            matchesOut.splice(mOut.indexOf, 1);
          }
        })
      });

      // HERE BE DRAGONS !!! 
      // Refactor and dissect
      const matches = [...matchesBoth, ...matchesOut, ...matchesIn];
      let html = matchesBoth.map((m) => {
        const u = this.users.find(u => u.id === m.matchOut.friendId);
        return `
        <li class="matches__list-item">
          <a href="#" data-id="${m.matchOut.friendId}">
            <img class="user__img" src="${u.picture.thumbnail}" alt="${u.username}'s avatar">
            <span class="name">${u.firstName} ${u.lastName}</span>
            ${this.getGenderIconHTML(u.gender)}
          </a>

          <div class="match__rating left">
            <i class="fas fa-share" title="Click to remove rating" data-user-id="${this.currentUserId}" data-friend-id="${u.id}"></i>
            ${this.getRatingIconHTML(m.matchOut.rating)}
          </div>

          <div class="match__rating right">
            <i class="fas fa-share rotate"></i>
            ${this.getRatingIconHTML(m.matchIn.rating)}
          </div>

          <div class="ratings" data-type="update">
            <i class="fas fa-ban" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="dislike" title="dislike"></i>
            <i class="fas fa-thumbs-up" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="like" title="like"></i>
            <i class="fas fa-heart" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="superlike" title="superlike"></i>
          </div>
        </li>`
      }).join('');


      html += matchesOut.map((m) => {
        const u = this.users.find(u => u.id === m.friendId);
        return `
        <li class="matches__list-item">
          <a href="#" data-id="${m.friendId}">
            <img class="user__img" src="${u.picture.thumbnail}" alt="${u.username}'s avatar">
            <span class="name">${u.firstName} ${u.lastName}</span>
            ${this.getGenderIconHTML(u.gender)}
          </a>

          <div class="match__rating left">
            <i class="fas fa-share" title="Click to remove rating" data-user-id="${this.currentUserId}" data-friend-id="${u.id}"></i>
            ${this.getRatingIconHTML(m.rating)}
          </div>

          <div class="ratings" data-type="update">
            <i class="fas fa-ban" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="dislike" title="dislike"></i>
            <i class="fas fa-thumbs-up" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="like" title="like"></i>
            <i class="fas fa-heart" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="superlike" title="superlike"></i>
          </div>
        </li>`
      }).join('');

      html += matchesIn.map((m) => {
        const u = this.users.find(u => u.id === m.userId);
        return `
        <li class="matches__list-item">
          <a href="#" data-id="${m.userId}">
            <img class="user__img" src="${u.picture.thumbnail}" alt="${u.username}'s avatar">
            <span class="name">${u.firstName} ${u.lastName}</span>
            ${this.getGenderIconHTML(u.gender)}
          </a>

          <div class="match__rating right">
            <i class="fas fa-share rotate"></i>
            ${this.getRatingIconHTML(m.rating)}
          </div>

          <div class="ratings" data-type="create">
            <i class="fas fa-ban" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="dislike" title="dislike"></i>
            <i class="fas fa-thumbs-up" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="like" title="like"></i>
            <i class="fas fa-heart" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="superlike" title="superlike"></i>
          </div>
        </li>
        `
      }).join('');
      this.$matchesList.innerHTML = html;
      this.registerListenersForMatches();
      this.updateNoMatchesFromUser(userId, matches);
    },

    /*
    Register listeners for the matches
    */
    registerListenersForMatches() {
      const ratings = document.querySelectorAll('.ratings');
      const removeRatings = document.querySelectorAll('.match__rating.left > .fa-share');
      
      // Adds a click listener to the rating icons to add a new match
      ratings.forEach(rating => {
        rating.addEventListener('click', (e) => {
          const userId = e.target.dataset.userId || e.target.parentNode.dataset.userId || e.target.parentNode.parentNode.dataset.userId;
          const friendId = e.target.dataset.friendId || e.target.parentNode.dataset.friendId || e.target.parentNode.parentNode.dataset.friendId;
          const ratingToGive = e.target.dataset.rating || e.target.parentNode.dataset.rating || e.target.parentNode.parentNode.dataset.rating;
          if (rating.dataset.type === 'update') {
            this.tinderApi.updateMatch(userId, friendId, ratingToGive);
          } else if (rating.dataset.type === 'create') {
            this.tinderApi.addMatch(userId, friendId, ratingToGive);
          };
        });
      });

      // Adds a click listener to delete a rating
      removeRatings.forEach(rating => {
        rating.addEventListener('click', (e) => {
          const userId = e.target.dataset.userId || e.target.parentNode.dataset.userId || e.target.parentNode.parentNode.dataset.userId;
          const friendId = e.target.dataset.friendId || e.target.parentNode.dataset.friendId || e.target.parentNode.parentNode.dataset.friendId;
          this.tinderApi.deleteMatch(userId, friendId);
        });
      });
    },

    getRatingIconHTML(rating) {
      if (rating === 'dislike') {
        return `<i class="fas fa-ban" title="dislike"></i>`
      } else if (rating === 'like') {
        return `<i class="fas fa-thumbs-up" title="like"></i>`
      } else {
        return `<i class="fas fa-heart" title="superlike"></i>`
      };
    },

    /*
    Populates the list of unmatched users
    */
    updateNoMatchesFromUser(userId, matches) {
      // Create a list of all outgoing matches friendIds
      const matchesFromUser = matches.map(m => m.friendId);
      // Create a list of all incoming matches userIds
      const matchesToUser = this.matches.filter(m => m.friendId === userId).map(m => m.userId);
      // Join the arrays
      const matchedUserIds = [matchesFromUser, matchesToUser].flat();
      // Push the current user to the array of userIds to ignore
      matchedUserIds.push(userId);
      // Compare the users against the userIds from matches and keep those that don't match
      const unmatchedUsers = this.users.filter(u => !matchedUserIds.includes(u.id));
      // Build the UI 
      this.$noMatchesList.innerHTML = unmatchedUsers.map((u) => {
        return `
        <li class="no-matches__list-item">
          <a href="#" data-id="${u.id}">
            <img class="user__img" src="${u.picture.thumbnail}" alt="${u.username}'s avatar">
            <span class="name">${u.firstName} ${u.lastName}</span>
            ${this.getGenderIconHTML(u.gender)}
          </a>
          <div class="ratings">
            <i class="fas fa-ban" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="dislike" title="dislike"></i>
            <i class="fas fa-thumbs-up" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="like" title="like"></i>
            <i class="fas fa-heart" data-user-id="${this.currentUserId}" data-friend-id="${u.id}" data-rating="superlike" title="superlike"></i>
          </div>
        </li>`
      }).join('');
      this.registerListenersForNoMatches();
    },
    registerListenersForNoMatches() {
      const noMatchesListItems = document.querySelectorAll('.no-matches__list-item > a');
      const ratings = document.querySelector('.ratings');

      
      // Shows the tooltip when hovering over a user in the no matches list, hides it when the mouse leaves the user
      noMatchesListItems.forEach(item => {
        // Show the tooltip when hovering over the user in the list
        item.addEventListener('mouseenter', (e) => {
          const userId = e.target.dataset.id || e.target.parentNode.dataset.id || e.target.parentNode.parentNode.dataset.id;
          // Show user details
          this.showToolTip(userId);
        });
        // Hide the tooltip when the mouse leaves the user
        item.addEventListener('mouseleave', (e) => {
          this.hideToolTip();
        });
      });

      
      // Adds a click listener to the rating icons to add a new match
      ratings.addEventListener('click', (e) => {
        const userId = e.target.dataset.userId || e.target.parentNode.dataset.userId || e.target.parentNode.parentNode.dataset.userId;
        const friendId = e.target.dataset.friendId || e.target.parentNode.dataset.friendId || e.target.parentNode.parentNode.dataset.friendId;
        const rating = e.target.dataset.rating || e.target.parentNode.dataset.rating || e.target.parentNode.parentNode.dataset.rating;
        // Add a new match
        this.createMatch(userId, friendId, rating);
      })
    },

    /*
    Shows the tooltip on the no matches list with details user information
    */
    showToolTip(userId) {
      this.$tooltip.style.display = 'flex';
      const user = this.users.find(u => u.id === userId);
      const html = `
        <img class="tt-image" src="${user.picture.large}" alt="${user.username}'s avatar">
        <h3 class="tt-name">${user.firstName} ${user.lastName} (${user.nationality})</h3>
        <h4 class="tt-username">${user.username}</h4>
        <p class="tt-dob">${moment().diff(moment(user.dayOfBirth), 'years')} years old</p>
        <p class="tt-location">${user.location.city} - ${user.location.country}</p>
        <div class="tt-info">
          <p class="tt-cell">${user.cell}</p>
        </div>
        <p class="tt-since">Member since: ${moment(user.createdAt).format('DD/MM/YYYY')}</p>
      `;
      this.$tooltip.innerHTML = html;
    },

    /*
    Hides the tooltip on the no matches list
    */
    hideToolTip() {
      this.$tooltip.style.display = 'none';
    },

    /*
    Gets all matches and stores them in the app
    */
    async fetchMatches() {
      const matches = await this.tinderApi.getMatches();
      this.matches = matches;
    },

    /*
    Adds a new match
    */
    async createMatch(userId, friendId, rating) {
      const newRating = await this.tinderApi.addMatch(userId, friendId, rating);
      alert(`Match added! from ${userId} to ${friendId} with rating ${rating}!`);
    },
  }
  app.initialize();
})();