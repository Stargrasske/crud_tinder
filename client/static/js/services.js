const TINDER_BASE_PATH = 'http://localhost:8080/api';

function TinderApi () {
  this.getUsers = async () => {    
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Something went wrong!', error);
    }
  };

  this.getUserById = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Something went wrong!', error);
    }
  };

  this.getReceivedMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=received`);
      const data = await response.json();
      return data;
    } catch (error){
      console.log('Something went wrong!', error);
    }
  };

  this.getSentMessagesFromUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=sent`);
      const data = await response.json();
      return data;
      } catch (error) {
        console.log('Something went wrong!', error);
      }
  };

  this.getConversationBetweenUsers = async (userId, friendId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/messages?type=conversation&friendId=${friendId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Something went wrong!', error);
    }
  };

  this.addMessageBetweenUsers = async (senderId, receiverId, message) => {
    try {
      const body = {
        senderId,
        receiverId,
        message,
      };

      const response = await fetch(`${TINDER_BASE_PATH}/messages`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Oh no! Cupid missed! Could not send your message!', error);
    }
  };

  this.deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/messages/${messageId}`, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Something went wrong', error);
    }
  };

  this.getMatches = async () => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/matches`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Something went wrong', error);
    }
  }

  this.getMatchesForUser = async (userId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/users/${userId}/matches`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Something went wrong!', error);
    }
  };

  this.addMatch = async (userId, friendId, rating) => {
    try {
      const body = {
        userId,
        friendId,
        rating,
      }

      const response = await fetch(`${TINDER_BASE_PATH}/matches`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Oh no! Cupid missed! Could not send your match!', error);
    }
  };

  this.updateMatch = async (userId, friendId, rating) => {
    try {
      const body = {
        rating,
      }

      const response = await fetch(`${TINDER_BASE_PATH}/matches/${userId}/${friendId}`, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Oh no! Cupid missed! Could not update your match!', error);
    }
  };

  this.deleteMatch = async (userId, friendId) => {
    try {
      const response = await fetch(`${TINDER_BASE_PATH}/matches/${userId}/${friendId}`, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Oh no! Could not remove your rating!', error);
    }
  }
}