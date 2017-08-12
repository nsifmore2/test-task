var MyForm = (function() {
    var validationSet = {
        fioRegexp: /^[А-ЯЁ][а-яё]* [А-ЯЁ][а-яё]* [А-ЯЁ][а-яё]*$/,

        emailRegexp: /^[a-zA-Z]+(([a-zA-Z0-9]*-?([a-zA-Z0-9]+\.[a-zA-Z0-9])?[a-zA-Z0-9]*)|([a-zA-Z0-9]*\.?([a-zA-Z0-9]+-[a-zA-Z0-9])?[a-zA-Z0-9]*))(@ya.ru|@yandex.ru|@yandex.by|@yandex.ua|@yandex.kz|@yandex.com)$/,
        emailMaxLimit: 30,

        phoneRegexp: /^\+7\([0-9]{3}\)[0-9]{3}\-[0-9]{2}\-[0-9]{2}$/,
        phoneSumLimit: 30,

        inputList: ["fio", "email", "phone"]
    };

    /**
     * Валидация пользовательского ввода
     *
     * @returns {{
     *     isValid: boolean,
     *     errorFields: Array
     * }}
     */
    var validate = function() {
        var data = getData();
        var errorFields = [];

        var isFioValid = validationSet.fioRegexp.test(data.fio);
        if (!isFioValid) {
            errorFields.push("fio");
        }

        var isEmailValid = validationSet.emailRegexp.test(data.email);
        if (isEmailValid) {
            var login = data.email.substring(0, data.email.indexOf("@"));
            isEmailValid = login.length < validationSet.emailMaxLimit;
        }
        if (!isEmailValid) {
            errorFields.push("email");
        }

        var isPhoneValid = validationSet.phoneRegexp.test(data.phone);
        if (isPhoneValid) {
            var strNumbers = data.phone.replace(/\D+/g, "");
            var numbers = strNumbers.split("");
            var sum = numbers.reduce(function (prev, curr) {
                return prev + Number(curr);
            }, 0);

            isPhoneValid = sum <= validationSet.phoneSumLimit;
        }
        if (!isPhoneValid) {
            errorFields.push("phone");
        }

        return {
            isValid: (errorFields.length === 0),
            errorFields: errorFields
        }
    };

    /**
     * Получение данных формы
     *
     * @returns {{
     *     fio: string,
     *     email: string,
     *     phone: string
     * }}
     */
    var getData = function() {
        var fio = $("[name='fio']").val();
        var email = $("[name='email']").val() + $("#currentDomain").text().slice(0, -1);
        var phone = $("[name='phone']").val();

        return {
            fio: fio,
            email: email,
            phone: phone
        }
    };

    /**
     * Задание данных формы
     *
     * @param formData
     */
    var setData = function(formData) {
        if (formData === null || formData === undefined) {
            return;
        }

        if (formData.fio !== null && formData.fio !== undefined) {
            $("[name='fio']").val(formData.fio);
        }

        if (formData.email !== null && formData.email !== undefined) {
            var email = formData.email.split("@");
            $("[name='email']").val(email[0]);
            $("#currentDomain").html("@" + email[1] + " <span class=\"caret\"></span>");
        }

        if (formData.phone !== null && formData.phone !== undefined) {
            $("[name='phone']").val(formData.phone);
        }
    };

    /**
     * Валидация и реквест
     */
    var submit = function () {
        var validationResult = validate();

        validationResultProcessing(validationResult.errorFields);

        if (validationResult.isValid) {
            $("#submitButton").prop("disabled", true);
            request();
        }
    };

    /**
     * Индикация полей ввода после валидации
     *
     * @param errorFields - лист невалидных полей ввода
     */
    var validationResultProcessing = function (errorFields) {
        validationSet.inputList.forEach(function (item) {
            if (errorFields.indexOf(item) === -1) {
                $("[name=" + item + "]").removeClass("error");
            } else {
                $("[name=" + item + "]").addClass("error");
            }
        });
    };

    var progressIntervalId = null;
    /**
     * Выполнение запроса
     */
    var request = function () {
        var url = $("#MyForm").attr("action");

        if (progressIntervalId !== null) {
            clearInterval(progressIntervalId);
            progressIntervalId = null;
        }

        $.ajax({
            url: url,
            success: function(data){
                var status = data.status;
                var elementId = "#resultContainer";

                if (status === "success") {
                    adjustClassInfo(elementId, "success", ["error", "progress"]);
                    $(elementId).text("Success");
                } else if (status === "error") {
                    adjustClassInfo(elementId, "error", ["success", "progress"]);
                    $(elementId).text(data.reason);
                } else if (status === "progress") {
                    adjustClassInfo(elementId, "progress", ["success", "error"]);
                    $(elementId).text("Timeout: " + data.timeout);

                    progressIntervalId = setInterval(request, data.timeout);
                }
            }
        });
    };

    /**
     * Замена взаимоисключающих классов элемента
     *
     * @param elementId - идентификатор элемента
     * @param classToAdd - класс, принадлежность которому должна быть добавлена
     * @param classesToRemove - классы, принадлежность которым должна быть снята
     */
    var adjustClassInfo = function(elementId, classToAdd, classesToRemove) {
        var element= $(elementId);
        element.addClass(classToAdd);

        classesToRemove.forEach(function(item) {
            element.removeClass(item);
        });
    };

    return {
        validate: validate,
        getData: getData,
        setData: setData,
        submit: submit
    };
})();


/** Listeners **/
(function() {
    var onSubmitButtonClick = $(document).ready(function(){
        $("#submitButton").click(function(){
            MyForm.submit();
        });
    });

    var onEmailDomainChange = $(document).ready(function(){
        $(".dropdown-menu li a").click(function(){
            var selectedDomain = $(this).text();
            $("#currentDomain").html(selectedDomain + " <span class=\"caret\"></span>");
        });
    });

    var tooltipInit = $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });
})();