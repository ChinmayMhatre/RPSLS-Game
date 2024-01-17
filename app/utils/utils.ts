export const moveMap = {
    'rock': 1,
    'paper': 2,
    'scissors': 3,
    'spock': 4,
    'lizard': 5
};

export const generateSaltUint256 = (): string => {
    const randomValues = new Uint32Array(8);
    window.crypto.getRandomValues(randomValues);
    const saltUint256 = randomValues.reduce((acc, value) => acc + value.toString(16).padStart(8, '0'), '');
    return BigInt(`0x${saltUint256}`).toString();
  };    

export const resetGame = () => {
    localStorage.removeItem('contractAddress')
    localStorage.removeItem('move');
    localStorage.removeItem('salt');                                    
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