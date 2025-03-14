// Simule un chargement et masque le loader après 3 secondes
setTimeout(() => {
    document.getElementById("loaderModal").style.display = "none";
}, 3000);

let currentOperation = null;
let currentUser = null;

// Fonction pour ouvrir le modal d'opération
function openOperationModal(operationType) {
    currentOperation = operationType;
    document.getElementById('operationModalTitle').textContent = `Opération : ${operationType}`;
    document.getElementById('recipientPhoneContainer').style.display =
        (operationType === 'transfert' || operationType === 'transfert_national' || operationType === 'transfert_international') ? 'block' : 'none';
    document.getElementById('operationModal').style.display = 'block';
}

// Fonction pour exécuter l'opération
function executeOperation() {
    const amount = document.getElementById('amount').value;
    const recipientPhone = document.getElementById('recipientPhone').value;

    const operationData = {
        action: 'operation',
        phone: currentUser.phone,
        amount: parseFloat(amount),
        operationType: currentOperation,
        recipientPhone: recipientPhone || null
    };

    showLoader();
    fetch('https://script.google.com/macros/s/AKfycbx1XNzVxhVUa81Sdch5SFBS0-WC6UmZRJSGjDXNt6w876pIv5P8W1DLBZdCVt3t_3nh/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(operationData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoader();
        if (data.status === 'success') {
            document.getElementById('balanceText').textContent = data.user.balance;
            loadHistory(currentUser.phone);
            showModalMessage('Opération réussie!', '😎');
            closeModal('operationModal');
        } else {
            showModalMessage(data.message, '😥');
        }
    });
}

// Fonction pour fermer un modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fonction pour afficher le loader
function showLoader() {
    document.getElementById('loaderModal').style.display = 'flex';
}

// Fonction pour masquer le loader
function hideLoader() {
    document.getElementById('loaderModal').style.display = 'none';
}

// Fonction pour afficher un message modal
function showModalMessage(message, icon = '🔔') {
    document.getElementById('modal-message').innerHTML = `<div class="icon">${icon}</div>${message}`;
    document.getElementById('messageModal').style.display = 'block';
}

// Gestion du formulaire d'opération
document.getElementById('operationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    executeOperation();
});

// Gestion de la connexion
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    showLoader();
    fetch(`https://script.google.com/macros/s/AKfycbx1XNzVxhVUa81Sdch5SFBS0-WC6UmZRJSGjDXNt6w876pIv5P8W1DLBZdCVt3t_3nh/exec?action=login&phone=${phone}&password=${password}`)
    .then(response => response.json())
    .then(data => {
        hideLoader();
        if (data.status === 'success') {
            localStorage.setItem('userPhone', phone);
            currentUser = data.user;
            showAccountSection();
            document.getElementById('account-name').textContent = data.user.name;
            document.getElementById('account-phone').textContent = data.user.phone;
            document.getElementById('balanceText').textContent = data.user.balance;
            loadHistory(phone);
        } else {
            showModalMessage(data.message);
        }
    });
});

// Gestion de l'inscription
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const phone = document.getElementById('register-phone').value;
    const name = document.getElementById('register-name').value;
    const password = document.getElementById('register-password').value;
    const registerData = {
        action: 'register',
        phone: phone,
        name: name,
        password: password
    };

    showLoader();
    fetch('https://script.google.com/macros/s/AKfycbx1XNzVxhVUa81Sdch5SFBS0-WC6UmZRJSGjDXNt6w876pIv5P8W1DLBZdCVt3t_3nh/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoader();
        if (data.status === 'success') {
            showModalMessage('Inscription réussie! Vous pouvez maintenant vous connecter.', '😊');
            showLoginForm();
        } else {
            showModalMessage(data.message, '😥');
        }
    });
});

// Charger l'historique des transactions
function loadHistory(phone) {
    fetch(`https://script.google.com/macros/s/AKfycbx1XNzVxhVUa81Sdch5SFBS0-WC6UmZRJSGjDXNt6w876pIv5P8W1DLBZdCVt3t_3nh/exec?action=getHistory&phone=${phone}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const historyList = document.getElementById('modal-transaction-history');
            historyList.innerHTML = '';
            data.history.forEach(transaction => {
                const li = document.createElement('li');
                li.textContent = `Date: ${transaction[0]}, Type: ${transaction[2]}, Montant: ${transaction[3]}`;
                historyList.appendChild(li);
            });
        }
    });
}

// Afficher l'historique des transactions
document.getElementById('show-history-btn').addEventListener('click', function() {
    const phone = currentUser.phone;
    loadHistory(phone);
    document.getElementById('historyModal').style.display = 'block';
});

// Basculer la visibilité du solde
function toggleBalanceVisibility() {
    const balanceText = document.getElementById('balanceText');
    const toggleBalanceIcon = document.getElementById('toggleBalanceIcon');

    if (balanceText.textContent === '******* F') {
        balanceText.textContent = `${currentUser.balance.toFixed(2)} XOF`;
        toggleBalanceIcon.classList.remove('fa-eye');
        toggleBalanceIcon.classList.add('fa-eye-slash');
    } else {
        balanceText.textContent = '******* F';
        toggleBalanceIcon.classList.remove('fa-eye-slash');
        toggleBalanceIcon.classList.add('fa-eye');
    }
}

// Déconnexion
function logoutUser() {
    localStorage.removeItem('userPhone');
    currentUser = null;
    showLoginForm();
}

// Fonctions pour afficher les sections
function showLoginForm() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('account-section').classList.add('hidden');
}

function showSignupForm() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.remove('hidden');
    document.getElementById('account-section').classList.add('hidden');
}

function showAccountSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('account-section').classList.remove('hidden');
}

// Fermer les modals en cliquant à l'extérieur
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Fermer les modals avec le bouton de fermeture
document.querySelectorAll('.close').forEach(function(closeButton) {
    closeButton.addEventListener('click', function() {
        closeButton.closest('.modal').style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const modalBtns = document.querySelectorAll('.modal-btn');
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close');

    modalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'flex';
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    });
});

const packages = {
    orange: [
        "1 Go à 1050 F",
        "2 Go à 2000 F",
        "5 Go à 4500 F"
    ],
    moov: [
        "1 Go à 1100 F",
        "2 Go à 2100 F",
        "5 Go à 4600 F"
    ],
    telecel: [
        "1 Go à 1000 F",
        "2 Go à 1900 F",
        "5 Go à 4400 F"
    ]
};

document.getElementById('operator').addEventListener('change', function() {
    const operator = this.value;
    const packageSelect = document.getElementById('package');

    // Clear previous options
    packageSelect.innerHTML = '<option value="">Sélectionnez un forfait</option>';

    if (operator && packages[operator]) {
        packages[operator].forEach(pkg => {
            const option = document.createElement('option');
            option.value = pkg;
            option.textContent = pkg;
            packageSelect.appendChild(option);
        });
    }
});

function submitForm() {
    const operator = document.getElementById('operator').value;
    const pkg = document.getElementById('package').value;
    const destinationNumber = document.getElementById('destinationNumber').value;
    const wariPayAccount = document.getElementById('wariPayAccount').value;

    if (operator && pkg && destinationNumber && wariPayAccount) {
        const data = {
            operator,
            pkg,
            destinationNumber,
            wariPayAccount
        };

        // Send data to Google Sheets using Google Apps Script
        fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            alert('Forfait acheté avec succès !');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        });
    } else {
        alert('Veuillez remplir tous les champs.');
    }
}

function goToHome() {
    window.location.href = 'index.html'; // Remplacez par le chemin de votre page d'accueil
}

// Retrait JS

function calculateFee() {
    let amount = document.getElementById('retraitAmount').value;
    let fee = (amount * 0.02).toFixed(2);
    document.getElementById('feeDisplay').innerText = 'Frais: ' + fee + ' XOF';
}

function executeRetrait() {
    let amount = document.getElementById('retraitAmount').value;
    let recipientPhone = document.getElementById('retraitPhone').value;
    let operator = document.getElementById('operator').value;
    let waripayAccount = document.getElementById('waripayAccount').value;

    if (recipientPhone === currentUser.phone) {
        alert('Vous ne pouvez pas effectuer un retrait vers votre propre numéro.');
        return;
    }

    const operationData = {
        phone: currentUser.phone,
        amount: parseFloat(amount),
        operationType: currentOperation,
        recipientPhone: recipientPhone,
        operator: operator,
        waripayAccount: waripayAccount,
    };

    // Envoyer les données à l'API Google Sheets
    fetch('YOUR_WEB_APP_URL_HERE', { // Remplacez par l'URL de votre application web
        method: 'POST',
        body: new URLSearchParams(operationData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            currentUser.balance -= amount;
            alert('Retrait réussi! Nouveau solde: ' + currentUser.balance.toFixed(2) + ' XOF');
        } else {
            alert('Erreur lors du retrait.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'opération.');
    });
}

function goToHomePage() {
    window.location.href = 'accueil.html'; // Remplacez par le chemin de votre page d'accueil
}

const operators = {
    "Burkina Faso": ["Orange Money", "Moov Money", "Telecel Money"],
    "Côte d'Ivoire": ["Orange Money", "Moov Money", "Wave"],
    "Niger": ["Orange Money", "Moov Money", "Telecel Money"],
    "Mali": ["Orange Money", "Sank Money"],
    "Togo": ["Flooz", "Moov Money"]
};

function updateOperators() {
    const country = document.getElementById('destinationCountry').value;
    const operatorSelect = document.getElementById('destinationOperator');
    operatorSelect.innerHTML = '<option value="" disabled selected>Sélectionnez l\'opérateur</option>';

    if (operators[country]) {
        operators[country].forEach(operator => {
            const option = document.createElement('option');
            option.value = operator;
            option.textContent = operator;
            operatorSelect.appendChild(option);
        });
    }
}

function calculateFee() {
    const amount = document.getElementById('transferAmount').value;
    const fee = (amount * 0.035).toFixed(2); // Calculer 3,5% du montant
    document.getElementById('feeDisplay').innerText = 'Frais: ' + fee + ' XOF';
}

function executeInternationalTransfer() {
    const country = document.getElementById('destinationCountry').value;
    const operator = document.getElementById('destinationOperator').value;
    const recipientPhone = document.getElementById('recipientPhone').value;
    const countryCode = document.getElementById('countryCode').value;
    const transferAmount = document.getElementById('transferAmount').value;
    const waripayAccount = document.getElementById('waripayAccount').value;

    const fee = (transferAmount * 0.035).toFixed(2); // Calculer 3,5% du montant
    const totalAmount = parseFloat(transferAmount) + parseFloat(fee);

    if (totalAmount > currentUser.balance) {
        alert('Solde insuffisant pour effectuer ce transfert.');
        return;
    }

    const operationData = {
        phone: currentUser.phone,
        destinationCountry: country,
        destinationOperator: operator,
        recipientPhone: recipientPhone,
        countryCode: countryCode,
        operationType: currentOperation,
        waripayAccount: waripayAccount,
        amount: totalAmount,
    };

    // Envoyer les données à l'API Google Sheets
    fetch('YOUR_WEB_APP_URL_HERE', { // Remplacez par l'URL de votre application web
        method: 'POST',
        body: new URLSearchParams(operationData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            currentUser.balance -= totalAmount;
            alert('Transfert international réussi! Nouveau solde: ' + currentUser.balance.toFixed(2) + ' XOF');
        } else {
            alert('Erreur lors du transfert international.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'opération.');
    });
}

function goToHomePage() {
    window.location.href = 'accueil.html'; // Remplacez par le chemin de votre page d'accueil
}

//unité js
function executeUnitPurchase() {
    const operator = document.getElementById('operator').value;
    const senderPhone = document.getElementById('senderPhone').value;
    const recipientPhone = document.getElementById('recipientPhone').value;
    const amount = document.getElementById('amount').value;
    const countryCode = document.getElementById('countryCode').value;
    const waripayAccount = document.getElementById('waripayAccount').value;

    const operationData = {
        phone: currentUser.phone,
        operator: operator,
        senderPhone: senderPhone,
        recipientPhone: recipientPhone,
        amount: amount,
        countryCode: countryCode,
        operationType: currentOperation,
        waripayAccount: waripayAccount,
    };

    // Envoyer les données à l'API Google Sheets
    fetch('YOUR_WEB_APP_URL_HERE', { // Remplacez par l'URL de votre application web
        method: 'POST',
        body: new URLSearchParams(operationData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            currentUser.balance -= parseFloat(amount);
            alert('Achat d\'unités réussi! Nouveau solde: ' + currentUser.balance.toFixed(2) + ' XOF');
        } else {
            alert('Erreur lors de l\'achat d\'unités.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'opération.');
    });
}

function goToHomePage() {
    window.location.href = 'accueil.html'; // Remplacez par le chemin de votre page d'accueil
}

// 1xbet js
function calculateFee() {
    const amount = document.getElementById('amount').value;
    const fee = (amount * 0.015).toFixed(2); // Calculer 1,5% du montant
    document.getElementById('feeDisplay').innerText = 'Frais: ' + fee + ' XOF';
}

function executeDeposit() {
    const platform = document.getElementById('bettingPlatform').value;
    const accountId = document.getElementById('accountId').value;
    const waripayPhone = document.getElementById('waripayPhone').value;
    const amount = document.getElementById('amount').value;

    const fee = (amount * 0.015).toFixed(2); // Calculer 1,5% du montant
    const totalAmount = parseFloat(amount) + parseFloat(fee);

    if (totalAmount > currentUser.balance) {
        alert('Solde insuffisant pour effectuer ce dépôt.');
        return;
    }

    const operationData = {
        phone: currentUser.phone,
        platform: platform,
        accountId: accountId,
        waripayPhone: waripayPhone,
        amount: totalAmount,
        operationType: currentOperation,
    };

    // Envoyer les données à l'API Google Sheets
    fetch('YOUR_WEB_APP_URL_HERE', { // Remplacez par l'URL de votre application web
        method: 'POST',
        body: new URLSearchParams(operationData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            currentUser.balance -= totalAmount;
            alert('Dépôt réussi! Nouveau solde: ' + currentUser.balance.toFixed(2) + ' XOF');
        } else {
            alert('Erreur lors du dépôt.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'opération.');
    });
}

function goToHomePage() {
    window.location.href = 'accueil.html'; // Remplacez par le chemin de votre page d'accueil
}

//tv script

function updateTVFields() {
    const tvProvider = document.getElementById('tvProvider').value;
    const tvType = document.getElementById('tvType').value;

    document.getElementById('tvAbonnementContainer').style.display = (tvType === 'abonnement' && tvProvider !== 'CANAL+') ? 'block' : 'none';
    document.getElementById('tvReabonnementContainer').style.display = (tvType === 'reabonnement') ? 'block' : 'none';
    document.getElementById('tvMonthContainer').style.display = (tvType === 'abonnement' && (tvProvider === 'AFRICA BOX' || tvProvider === 'MA TÉLÉ')) ? 'block' : 'none';
    document.getElementById('tvReabonnementMonthContainer').style.display = (tvType === 'reabonnement' && (tvProvider === 'AFRICA BOX' || tvProvider === 'MA TÉLÉ')) ? 'block' : 'none';
}

function executeTVOperation() {
    const tvProvider = document.getElementById('tvProvider').value;
    const tvType = document.getElementById('tvType').value;
    let tvAbonnement = '';
    let tvReabonnement = '';
    let tvMonth = '';
    let tvReabonnementMonth = '';
    const waripayAccount = document.getElementById('waripayAccount').value;
    const countryCode = document.getElementById('countryCode').value;

    if (tvType === 'abonnement' && tvProvider !== 'CANAL+') {
        tvAbonnement = document.getElementById('tvAbonnement').value;
    }
    if (tvType === 'reabonnement') {
        tvReabonnement = document.getElementById('tvReabonnement').value;
    }
    if (tvType === 'abonnement' && (tvProvider === 'AFRICA BOX' || tvProvider === 'MA TÉLÉ')) {
        tvMonth = document.getElementById('tvMonth').value;
    }
    if (tvType === 'reabonnement' && (tvProvider === 'AFRICA BOX' || tvProvider === 'MA TÉLÉ')) {
        tvReabonnementMonth = document.getElementById('tvReabonnementMonth').value;
    }

    const operationData = {
        phone: currentUser.phone,
        tvProvider: tvProvider,
        tvType: tvType,
        tvAbonnement: tvAbonnement,
        tvReabonnement: tvReabonnement,
        tvMonth: tvMonth,
        tvReabonnementMonth: tvReabonnementMonth,
        waripayAccount: waripayAccount,
        countryCode: countryCode,
        operationType: currentOperation,
    };

    // Envoyer les données à l'API Google Sheets
    fetch('YOUR_WEB_APP_URL_HERE', { // Remplacez par l'URL de votre application web
        method: 'POST',
        body: new URLSearchParams(operationData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Opération TV réussie!');
        } else {
            alert('Erreur lors de l\'opération TV.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'opération.');
    });
}

function goToHomePage() {
    window.location.href = 'accueil.html'; // Remplacez par le chemin de votre page d'accueil
}

function updateFactureFields() {
    const factureService = document.getElementById('factureService').value;
    document.getElementById('factureOneaContainer').style.display = (factureService === 'ONEA') ? 'block' : 'none';
    document.getElementById('factureSonabelContainer').style.display = (factureService === 'SONABEL') ? 'block' : 'none';
}

function executeFacturePayment() {
    const factureService = document.getElementById('factureService').value;
    const factureNumber = (factureService === 'ONEA') ? document.getElementById('factureOnea').value : document.getElementById('factureSonabel').value;
    const amount = document.getElementById('factureAmount').value;
    const waripayAccount = document.getElementById('waripayAccount').value;

    const operationData = {
        phone: currentUser.phone,
        factureService: factureService,
        factureNumber: factureNumber,
        amount: amount,
        waripayAccount: waripayAccount,
        operationType: currentOperation,
    };

    // Envoyer les données à l'API Google Sheets
    fetch('YOUR_WEB_APP_URL_HERE', { // Remplacez par l'URL de votre application web
        method: 'POST',
        body: new URLSearchParams(operationData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            currentUser.balance -= parseFloat(amount);
            alert('Paiement de facture réussi! Nouveau solde: ' + currentUser.balance.toFixed(2) + ' XOF');
        } else {
            alert('Erreur lors du paiement de la facture.');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'opération.');
    });
}

function goToHomePage() {
    window.location.href = 'accueil.html'; // Remplacez par le chemin de votre page d'accueil
}
