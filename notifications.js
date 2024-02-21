const notificationErrorMessage = document.querySelector('.mods__error-message');

let isGranted = false;

const requestForNotification = () => {
    Notification.requestPermission().then(permission => {
        if (permission == 'granted') {
            notificationErrorMessage.classList.add('hidden');
            isGranted = true;
            
        }   
        else {
            isGranted = false;
            notificationErrorMessage.classList.remove('hidden');
        } 
        
    })
    return isGranted;
}

const notify = (text) =>  {
    const notification = new Notification(
        'Pomodoro notification', {
            body: text,
            icon: './src/tomato-full.svg',
            tag: 'pomodoro message'
        }
    )
    notification.addEventListener('error', requestForNotification);
}

export {requestForNotification, notify}
