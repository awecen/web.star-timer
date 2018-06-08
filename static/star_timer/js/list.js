List = {

    init: function(){
        $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                console.log(result);
            },
            "error": function (e) {
                alert('Error:' + e);
            }
        })
    },

};

List.init();