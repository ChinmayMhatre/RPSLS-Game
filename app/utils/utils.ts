export const moveMap = {
    'rock': 1,
    'paper': 2,
    'scissors': 3,
    'spock': 4,
    'lizard': 5
};

export const resetGame = () => {
    localStorage.removeItem('contractAddress')
    localStorage.removeItem('move');
    localStorage.removeItem('salt');
    localStorage.removeItem('saltExpiration');                                          
};

export const saveGame = (salt:string, move:string, contractAddress:string)=> {          
    localStorage.setItem('salt', salt);
    localStorage.setItem('move', move);
    localStorage.setItem('contractAddress', contractAddress)
};

export const getGameState = () => {
    return {
        salt: localStorage.getItem('salt'),
        move: localStorage.getItem('move'),
        contractAddress: localStorage.getItem('contractAddress'),
    };
};