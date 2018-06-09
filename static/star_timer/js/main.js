let Main = {

    // 最新ログ時刻(TR版)
    latestStartTime : new Date(),

    // 最新ログステータス(TR版)
    latestStatus : false,

    // 最新ログID(TR版)
    latestRecordId: 0,

    // 本日分全ログ
    todayLogs: {},

    // 継続タイマーID
    nowTimerId: 0,

    // 累積タイマーID
    totalTimerId: 0,

    // 初期処理
    init: function(){
        Main.attachEvents();
        Main.getLatestTimerRecord();
        Main.getTodayTimerRecord();
    },

    // イベント付加
    attachEvents: function(){
        // 状態スイッチボタンを押したとき
        $(document).on('click', '.btn-change', function(){
            Main.setNewTimerRecord();
        });

        // 画面更新ボタンを押したとき
        $(document).on('click', '.reload', function(){
            location.reload(true);
        });

        // 履歴とかのページ移動ボタンを押したとき
        $(document).on('click', '.change-view', function(){
           location.href = 'http://127.0.0.1:8000/star_timer/logs/';
        });

        // メモのフォーカスが外れたとき、自動保存
        $(document).on('focusout', '#timer-record-note', function(){
            Main.saveNote();
        });
    },

     // 最新ログ取得API
    getLatestTimerRecord: function(){
        $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/latest/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Main.latestStartTime = result[0].start_time;
                Main.latestStatus = result[0].is_worn;
                Main.latestRecordId = result[0].id;
                Main.latestRecord = result[0];
                Main.setStatus();
                Main.setButton();
                Main.setDelta();
                Main.setNote(Main.latestRecord.note);
                Main.startNowTimer();
            },
            "error": function (e) {
                alert('Error:' + e);
            }
        })
    },

     // 本日分ログ取得API
    getTodayTimerRecord: function(){
         $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/today/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Main.todayLogs = result;
                Main.setTotal();
                Main.startTotalTimer();
            },
            "error": function (e) {
                alert('Error:' + e);
            }
        });
    },

    // ステータス表示
    setStatus: function(){
        if(Main.latestStatus){
            $('.label-status').removeClass('false').addClass('true').text('装着中')
        }else{
            $('.label-status').removeClass('true').addClass('false').text('休憩中')
        }
    },

    // 操作ボタン表示
    setButton: function(){
        if(Main.latestStatus){
            $('.btn-change.worn').addClass('disabled');
            $('.btn-change.none').removeClass('disabled');
        }else{
            $('.btn-change.worn').removeClass('disabled');
            $('.btn-change.none').addClass('disabled');
        }
    },

    // 差分をタイマーにセット
    setDelta: function(){
        let delta = Main.getDelta(new Date(), new Date(Main.latestStartTime));
        $('.delta-hours').text(Tools.padZero(delta.deltaHours));
        $('.delta-minutes').text(Tools.padZero(delta.deltaMinutes));
        $('.delta-seconds').text(Tools.padZero(delta.deltaSeconds));
    },

    // newerとolderの差分取得
    getDelta: function(newer, older){

        let dd = newer.getDate() - older.getDate();
        let dh = newer.getHours() - older.getHours();
        let dm = newer.getMinutes() - older.getMinutes();
        let ds = newer.getSeconds() - older.getSeconds();

        // 負値調節(秒)
        if(ds < 0){
          ds += 60;
          dm -= 1;
        }

        // 負値調節(分)
        if(dm < 0){
            dm += 60;
            dh -= 1;
        }

        // 負値調節(時)
        if(dh < 0){
            dh += 24;
            dd -= 1;
        }

        return {
            deltaDate : dd,
            deltaHours : dh,
            deltaMinutes : dm,
            deltaSeconds : ds,
        };

    },

    // 本日分累計計算
    getTotal: function(){
         let wornLogs = {
            deltaDate : 0,
            deltaHours : 0,
            deltaMinutes : 0,
            deltaSeconds : 0,
        };
        let noneLogs = {
            deltaDate : 0,
            deltaHours : 0,
            deltaMinutes : 0,
            deltaSeconds : 0,
        };

        for(let i = 0; i < Main.todayLogs.length; i++){
            let delta = {};

            // 差分取得(最後は"今日の0時0分0秒"との差分)
            if(i < Main.todayLogs.length - 1){
                delta = Main.getDelta(
                    new Date(Main.todayLogs[i].end_time),
                    new Date(Main.todayLogs[i].start_time)
                );
            } else {
                delta = Main.getDelta(
                    new Date(Main.todayLogs[i].end_time),
                    new Date(new Date().setHours(0,0,0,0))
                );
            }
            // 差分積み上げ
            if(Main.todayLogs[i].is_worn){
                wornLogs.deltaDate += delta.deltaDate;
                wornLogs.deltaHours += delta.deltaHours;
                wornLogs.deltaMinutes += delta.deltaMinutes;
                wornLogs.deltaSeconds += delta.deltaSeconds;
            } else {
                noneLogs.deltaDate += delta.deltaDate;
                noneLogs.deltaHours += delta.deltaHours;
                noneLogs.deltaMinutes += delta.deltaMinutes;
                noneLogs.deltaSeconds += delta.deltaSeconds;
            }
        }

        return {
             'wornLogs': wornLogs,
             'noneLogs': noneLogs
        }
    },

    // 繰り上げ処理
    moveUpTotal : function(totalLog){
        totalLog.noneLogs.deltaMinutes += totalLog.noneLogs.deltaSeconds / 60 | 0;
        totalLog.noneLogs.deltaSeconds = totalLog.noneLogs.deltaSeconds % 60;

        totalLog.noneLogs.deltaHours += totalLog.noneLogs.deltaMinutes / 60 | 0;
        totalLog.noneLogs.deltaMinutes = totalLog.noneLogs.deltaMinutes % 60;

        totalLog.noneLogs.deltaDate += totalLog.noneLogs.deltaHours / 24 | 0;
        totalLog.noneLogs.deltaHours = totalLog.noneLogs.deltaHours % 24;

        totalLog.wornLogs.deltaMinutes += totalLog.wornLogs.deltaSeconds / 60 | 0;
        totalLog.wornLogs.deltaSeconds = totalLog.wornLogs.deltaSeconds % 60;

        totalLog.wornLogs.deltaHours += totalLog.wornLogs.deltaMinutes / 60 | 0;
        totalLog.wornLogs.deltaMinutes = totalLog.wornLogs.deltaMinutes % 60;

        totalLog.wornLogs.deltaDate += totalLog.wornLogs.deltaHours / 24 | 0;
        totalLog.wornLogs.deltaHours = totalLog.wornLogs.deltaHours % 24;

        return totalLog;
    },

    // 本日分累計セット
    setTotal: function(){
        let totalLog = Main.moveUpTotal(Main.getTotal());
        let delta = Main.getDelta(new Date(), new Date(Main.latestStartTime));

        if(Main.latestStatus){
            totalLog.wornLogs.deltaDate += delta.deltaDate;
            totalLog.wornLogs.deltaHours += delta.deltaHours;
            totalLog.wornLogs.deltaMinutes += delta.deltaMinutes;
            totalLog.wornLogs.deltaSeconds += delta.deltaSeconds;
        }else{
            totalLog.noneLogs.deltaDate += delta.deltaDate;
            totalLog.noneLogs.deltaHours += delta.deltaHours;
            totalLog.noneLogs.deltaMinutes += delta.deltaMinutes;
            totalLog.noneLogs.deltaSeconds += delta.deltaSeconds;
        }
        totalLog = Main.moveUpTotal(totalLog);

        // 表示セット
        $('.total .worn .total-hours ').text(Tools.padZero(totalLog.wornLogs.deltaHours));
        $('.total .worn .total-minutes ').text(Tools.padZero(totalLog.wornLogs.deltaMinutes));
        $('.total .worn .total-seconds ').text(Tools.padZero(totalLog.wornLogs.deltaSeconds));

        $('.total .none .total-hours ').text(Tools.padZero(totalLog.noneLogs.deltaHours));
        $('.total .none .total-minutes ').text(Tools.padZero(totalLog.noneLogs.deltaMinutes));
        $('.total .none .total-seconds ').text(Tools.padZero(totalLog.noneLogs.deltaSeconds));
    },

    // 継続タイマーくるくる
    startNowTimer: function(){
        Main.nowTimerId =
            setInterval(function(){
                Main.setDelta()
	        },200);
    },

    // 累積タイマーくるくる
    startTotalTimer: function(){
         Main.totalTimerId =
            setInterval(function(){
                Main.setTotal()
            },200);
    },

    // メモ反映
    setNote: function(note){
        $('#timer-record-note').focus();
        $('#timer-record-note').val(note);
        $('#timer-record-note').blur();
        M.textareaAutoResize($('#timer-record-note'));
    },

    // メモのみ保存API
    saveNote: function(){
        let updateData = {
            "start_time": Main.latestRecord.start_time,
            "end_time": Main.latestRecord.end_time,
            "is_worn": Main.latestRecord.is_worn,
            "note": $('#timer-record-note').val(),
        }

        // 更新API
        $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/list/" + Main.latestRecord.id + "/",
            "type": "PUT",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "data": updateData,
            "success": function() {

            },
            "error": function (e) {
                alert('Error:' + e);
            }
        })
    },

    // スイッチログ記録API(TR版)
    setNewTimerRecord: function(){

        let now = Tools.convertToDbFormat(new Date());

        // 更新用データ
        let updateData = {
            "start_time": Main.latestStartTime,
            "end_time": now,
            "is_worn": Main.latestStatus,
            "note": $('#timer-record-note').val()
        }

        // 新規作成用データ
        let newData = {
            "start_time": now,
            "end_time": "",
            "is_worn": !(Main.latestStatus),
            "note": "" // TODO: Note Insert Form
        };

        // 更新API
        $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/list/" + Main.latestRecordId + "/",
            "type": "PUT",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "data": updateData,
            "success": function() {

            },
            "error": function (e) {
                alert('Error:' + e);
            }
        })

        // 新規作成API
        $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/list/",
            "type": "POST",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "data": newData,
            "success": function() {
                // タイマーストップ
                clearInterval(Main.nowTimerId);
                clearInterval(Main.totalTimerId);
                // 最新取得
                Main.getLatestTimerRecord();
                Main.getTodayTimerRecord();
                // お知らせ
                Tools.popSimpleToast('状態を切り替えました。<br>（メモがリセットされました。)')
            },
            "error": function (e) {
                alert('Error:' + e);
            }
        });
    },

};

let Tools = {
    // タイマー用数値の0パディング
    padZero: function(number){
       return ( '00' + number ).slice( -2 );
    },

    // DB登録用DateTimeフォーマットへ変換
    convertToDbFormat: function(date){
        return date.getFullYear() + "-" +
            Tools.padZero((date.getMonth() + 1)) + "-" +
            Tools.padZero(date.getDate()) + "T" +
            Tools.padZero(date.getHours()) + ":" +
            Tools.padZero(date.getMinutes()) + ":" +
            Tools.padZero(date.getSeconds()) +
            ( 0 - (date.getTimezoneOffset() / 60) < 0 ?
                '-' + Tools.padZero(date.getTimezoneOffset() / 60) + ":00"
                : '+' + Tools.padZero(0 - (date.getTimezoneOffset() / 60)) + ":00");
    },

    // Materializeのトースター
    popSimpleToast: function(str){
        M.toast({
            'html': str,
        });
    },

};

Main.init();