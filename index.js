var MyForm = (function() {

    /**
     * Валидация пользовательского ввода
     *
     * @returns {{
     *     isValid: boolean,
     *     errorFields: Array
     * }}
     */
    var validate = function() {
        return {
            isValid: true,
            errorFields: []
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
        var email = $("[name='email']").val();
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

        if (validationResult.isValid) {
            request();
        } else {

        }
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
            success: function(data, textStatus){
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
})();