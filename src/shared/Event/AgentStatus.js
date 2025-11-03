class AgentStatus {
  static LOGIN = 'LOGIN';
  static LOGOUT = 'LOGOUT';

  static values() {
    return [
      AgentStatus.LOGIN,
      AgentStatus.LOGOUT
    ];
  }

  static isValid(status) {
    return AgentStatus.values().includes(status);
  }

  static fromString(name) {
    return AgentStatus.values().find(status => status.name === name) || null;
  }

}


module.exports = AgentStatus