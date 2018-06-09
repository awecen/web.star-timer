let Logs = {

    // 全ログ
    latestAllRecords : {},

    // 日別集計ログ
    dailyRecords : [],

    // 日別集計ログ(秒換算)
    dailyRecordsBySeconds: [],

    // グラフ表示用日毎集計ログ
    dailyRecordsByDailyGraph: [],

    // 初期処理
    init: function(){
        $('.tabs').tabs(); // Initialize Materialize Tab Components
        Logs.attachEvents();
        Logs.getTimerRecords(Logs.setAllData);
    },

    // 各種イベント付加
    attachEvents: function () {
        $(document).on('click', '.reload', function(){
            location.reload(true);
        });
        $(document).on('click', '.change-view', function(){
           location.href = 'http://127.0.0.1:8000/star_timer/';
        });
        // [グラフ] メモ
        $(document).on('click', '#graph .axis-note .base .note span', function(e){
            Logs.showNoteDetail($(e.currentTarget).parent().attr('data-val'));
        });
        // 「前日」ボタン
        $(document).on('click', '#graph .date-picker .btn-before', function(){
            let targetDate = new Date($('#graph .date-picker .label-date span').attr('date'));
            targetDate.setDate(targetDate.getDate() - 1);
            Logs.setRecordsToGraph(targetDate);
            Logs.setTargetDate(targetDate);
        });
        // 「翌日」ボタン
        $(document).on('click', '#graph .date-picker .btn-next', function(){
            let targetDate = new Date($('#graph .date-picker .label-date span').attr('date'));
            targetDate.setDate(targetDate.getDate() + 1);
            Logs.setRecordsToGraph(targetDate);
            Logs.setTargetDate(targetDate);
        });
        // [グラフ] メモ詳細ダイアログ 背景クリックでも閉じる
        // $(document).on('click', '.note-detail', function(){
        //     Logs.hideNoteDetail();
        // });
        // [グラフ] メモ詳細ダイアログ 閉じるボタン
        $(document).on('click', '.note-detail .body .footer .btn-close', function(){
            Logs.hideNoteDetail();
        });
        // [グラフ] メモ詳細ダイアログ メモ内容の変更があれば保存ボタンactivate
        $(document).on('change', '#note-detail-input', function(){
            $('.btn-save').removeClass('disabled');
        });
        // [グラフ] メモ詳細ダイアログ 保存ボタン
        $(document).on('click', '.note-detail .body .footer .btn-save', function(){
            Logs.saveNote();
        });
    },

    // 全ログ取得API
    getTimerRecords: function(after){
        $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Logs.latestAllRecords = result;
                after();
            },
            "error": function (e) {
                alert('Error:' + e);
            }
        });
    },

    setAllData: function(){
        Logs.setRecordsToList(); // リストタイプに反映
        Logs.setRecordsToStatistic(); // 統計タイプに反映
        Logs.getRecordsToGraph(); //グラフタイプ用にデータ集計
        Logs.setRecordsToGraph(new Date()); //グラフタイプに反映(今日のみ)
        Logs.setTargetDate(new Date()); // 表示日付と累計
    },

    // リスト形式ログ表示設定
    // TODO: 現在はStart Timeだけ表示
    setRecordsToList: function(){
        $('.log-list table tbody tr').remove();
        for(let i = 0; i < Logs.latestAllRecords.length; i++){
            // 最新20件のみ表示
            if(i < 20) {
                let log = Logs.latestAllRecords[i];
                let start_time = new Date(log.start_time);
                let start_time_str =
                    start_time.getFullYear() + "-" +
                    Tools.padZero((start_time.getMonth() + 1)) + "-" +
                    Tools.padZero(start_time.getDate()) + " " +
                    Tools.padZero(start_time.getHours()) + ":" +
                    Tools.padZero(start_time.getMinutes()) + ":" +
                    Tools.padZero(start_time.getSeconds());

                let data = {
                    "time": start_time_str,
                    "is_worn": log.is_worn,
                    "note": log.note,
                };
                $('.log-list table tbody').append(Logs.createListRowElement(data));
            }
        }
    },

    // リスト形式ログのリスト要素作成
    createListRowElement: function(data){
        let tr = $('<tr></tr>');
        let td_time = $('<td>' + data.time + '</td>');
        let td_status = $('<td></td>');
        if(data.is_worn){
            // td_status.append($('<span class="label label-warning">休憩</span>'));
            // td_status.append($('<span>→</span>'));
            td_status.append($('<span class="label label-success">装着</span>'));
        }else{
            // td_status.append($('<span class="label label-success">装着</span>'));
            // td_status.append($('<span>→</span>'));
            td_status.append($('<span class="label label-warning">休憩</span>'));
        }
        let td_note = $('<td>' + data.note + '</td>');
        tr.append(td_time);
        tr.append(td_status);
        tr.append(td_note);
        return tr;
    },

    // 統計形式ログ集計
    getRecordsToStatistic: function(){
         let tempLogs = { // 日別累積ログ元配列
            'date': "",
            'wornLogs': {
                deltaDate : 0,
                deltaHours : 0,
                deltaMinutes : 0,
                deltaSeconds : 0,
            },
            'noneLogs':{
                deltaDate : 0,
                deltaHours : 0,
                deltaMinutes : 0,
                deltaSeconds : 0,
            }
        };
        for(let i = 0; i < Logs.latestAllRecords.length; i++) {
            let log = Logs.latestAllRecords[i];
            // let before_log = i > 0 ? Logs.latestAllRecords[i-1]:[];
            // let log = Logs.latestAllRecords[i];
            // let next_log = i + 1 < Logs.latestAllRecords.length ? Logs.latestAllRecords[i+1]: [];
            //
            // let before_log_date = new Date(before_log.switch_time);
            // let log_date = new Date(log.switch_time);
            // let next_log_date = new Date(next_log.switch_time);
            // let log_date_midnight =new Date(new Date(log.switch_time).setHours(0,0,0,0));

            let log_start_time_obj = new Date(log.start_time);
            let log_end_time_obj = log.end_time ? new Date(log.end_time) : new Date();
            let log_midnight_obj = new Date(new Date(log.end_time).setHours(0,0,0,0));
            let base_start_time_obj = new Date(log_start_time_obj.getTime());
            let base_end_time_obj = new Date(log_end_time_obj.getTime());

            // 開始時間と終了時間で日付が変わった場合
            // 開始時間を午前0時にして、
            // 「午前0時から終了時間」の差分取得
            if(!Tools.compareDate(log_end_time_obj, log_start_time_obj)){
                base_start_time_obj = new Date(log_midnight_obj.getTime());
            }

            // 差分取得
            let delta = Logs.getDelta(base_end_time_obj, base_start_time_obj);

            // 差分積み上げ
            if(log.is_worn){
                tempLogs.wornLogs.deltaDate += delta.deltaDate;
                tempLogs.wornLogs.deltaHours += delta.deltaHours;
                tempLogs.wornLogs.deltaMinutes += delta.deltaMinutes;
                tempLogs.wornLogs.deltaSeconds += delta.deltaSeconds;
            } else {
                tempLogs.noneLogs.deltaDate += delta.deltaDate;
                tempLogs.noneLogs.deltaHours += delta.deltaHours;
                tempLogs.noneLogs.deltaMinutes += delta.deltaMinutes;
                tempLogs.noneLogs.deltaSeconds += delta.deltaSeconds;
            }

             // 繰り上げ処理
            tempLogs.noneLogs.deltaMinutes += tempLogs.noneLogs.deltaSeconds / 60 | 0;
            tempLogs.noneLogs.deltaSeconds = tempLogs.noneLogs.deltaSeconds % 60;

            tempLogs.noneLogs.deltaHours += tempLogs.noneLogs.deltaMinutes / 60 | 0;
            tempLogs.noneLogs.deltaMinutes = tempLogs.noneLogs.deltaMinutes % 60;

            tempLogs.noneLogs.deltaDate += tempLogs.noneLogs.deltaHours / 24 | 0;
            tempLogs.noneLogs.deltaHours = tempLogs.noneLogs.deltaHours % 24;

            tempLogs.wornLogs.deltaMinutes += tempLogs.wornLogs.deltaSeconds / 60 | 0;
            tempLogs.wornLogs.deltaSeconds = tempLogs.wornLogs.deltaSeconds % 60;

            tempLogs.wornLogs.deltaHours += tempLogs.wornLogs.deltaMinutes / 60 | 0;
            tempLogs.wornLogs.deltaMinutes = tempLogs.wornLogs.deltaMinutes % 60;

            tempLogs.wornLogs.deltaDate += tempLogs.wornLogs.deltaHours / 24 | 0;
            tempLogs.wornLogs.deltaHours = tempLogs.wornLogs.deltaHours % 24;

            // 日をまたいでいる場合
            // 今までの分を計上して新しいLogs配列を生成
            if(!Tools.compareDate(log_end_time_obj, log_start_time_obj)){
                // 今までの集計分を計上
                tempLogs.date = new Date(log_midnight_obj.getTime());
                Logs.dailyRecords.push(tempLogs);

                // 新たに集計用配列を生成
                tempLogs = { // 日別累積ログ元配列
                    'date': '',
                    'wornLogs': {
                        deltaDate : 0,
                        deltaHours : 0,
                        deltaMinutes : 0,
                        deltaSeconds : 0,
                    },
                    'noneLogs':{
                        deltaDate : 0,
                        deltaHours : 0,
                        deltaMinutes : 0,
                        deltaSeconds : 0,
                    }
                };
                // 「開始時間から午前0時」分を先に積み上げておく
                let midnight = new Date(new Date(log.end_time).setHours(0,0,0,0));
                let delta = Logs.getDelta(midnight, new Date(log.start_time));
                if(log.is_worn){
                    tempLogs.wornLogs.deltaDate += delta.deltaDate;
                    tempLogs.wornLogs.deltaHours += delta.deltaHours;
                    tempLogs.wornLogs.deltaMinutes += delta.deltaMinutes;
                    tempLogs.wornLogs.deltaSeconds += delta.deltaSeconds;
                } else {
                    tempLogs.noneLogs.deltaDate += delta.deltaDate;
                    tempLogs.noneLogs.deltaHours += delta.deltaHours;
                    tempLogs.noneLogs.deltaMinutes += delta.deltaMinutes;
                    tempLogs.noneLogs.deltaSeconds += delta.deltaSeconds;
                }
            }

            // ログの最後の場合
            // 計上前に午前0時から開始時間を積み上げてから計上
            if(i === Logs.latestAllRecords.length - 1){
                let midnight = new Date(new Date(log.end_time).setHours(0,0,0,0));
                tempLogs.date = midnight;
                let delta = Logs.getDelta(new Date(log.start_time), midnight);
                if(!log.is_worn){
                    tempLogs.wornLogs.deltaDate += delta.deltaDate;
                    tempLogs.wornLogs.deltaHours += delta.deltaHours;
                    tempLogs.wornLogs.deltaMinutes += delta.deltaMinutes;
                    tempLogs.wornLogs.deltaSeconds += delta.deltaSeconds;
                } else {
                    tempLogs.noneLogs.deltaDate += delta.deltaDate;
                    tempLogs.noneLogs.deltaHours += delta.deltaHours;
                    tempLogs.noneLogs.deltaMinutes += delta.deltaMinutes;
                    tempLogs.noneLogs.deltaSeconds += delta.deltaSeconds;
                }
                Logs.dailyRecords.push(tempLogs);
            }
        }



        // 秒数換算(※本日分は除外する)
        Logs.dailyRecords.forEach(function(log){
            if(!Tools.compareDate(log.date, new Date())){
               let converted = {
                    'date': log.date,
                    'worn': Tools.convertToSeconds(log.wornLogs),
                    'none': Tools.convertToSeconds(log.noneLogs),
               };
               Logs.dailyRecordsBySeconds.push(converted);
            }
        });

    },

    // 統計形式ログ表示設定
    setRecordsToStatistic: function(){
        Logs.getRecordsToStatistic();

        // 合計
        let worn_sum = 0;
        let none_sum = 0;
        Logs.dailyRecordsBySeconds.forEach(function(log){
            worn_sum += log.worn;
            none_sum += log.none;
        });

        // 平均
        let worn_average = Tools.convertToDatetime(worn_sum / Logs.dailyRecordsBySeconds.length | 0);
        let none_average = Tools.convertToDatetime(none_sum / Logs.dailyRecordsBySeconds.length | 0);

        // ページ反映
        $('#statistic .average .worn .delta-hours').text(Tools.padZero(worn_average.deltaHours));
        $('#statistic .average .worn .delta-minutes').text(Tools.padZero(worn_average.deltaMinutes));
        $('#statistic .average .worn .delta-seconds').text(Tools.padZero(worn_average.deltaSeconds));
        $('#statistic .average .none .delta-hours').text(Tools.padZero(none_average.deltaHours));
        $('#statistic .average .none .delta-minutes').text(Tools.padZero(none_average.deltaMinutes));
        $('#statistic .average .none .delta-seconds').text(Tools.padZero(none_average.deltaSeconds));

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

    // グラフ形式ログ集計
    getRecordsToGraph: function(){
        Logs.dailyRecordsByDailyGraph = [];
        let tempLogs = [];
        for(let i = 0; i < Logs.latestAllRecords.length; i++){
            let log = Logs.latestAllRecords[i];
            let log_start_time_obj = new Date(log.start_time);
            let log_end_time_obj = log.end_time ? new Date(log.end_time) : new Date();
            // 日付マタギの場合は
            // ログを午前0時で２つに分割してそれぞれ日毎の配列へpush
            if(!Tools.compareDate(log_end_time_obj, log_start_time_obj)){
                let midnight = new Date(log_end_time_obj.setHours(0,0,0,0));
                tempLogs.push({
                    'id' : log.id,
                    'start_time' : Tools.convertToDbFormat(midnight),
                    'end_time' : log.end_time,
                    'is_worn' : log.is_worn,
                    'note' : log.note,
                });
                Logs.dailyRecordsByDailyGraph.push(tempLogs);
                tempLogs = [];
                tempLogs.push({
                    'id' : log.id,
                    'start_time' : log.start_time,
                    'end_time' : Tools.convertToDbFormat(midnight),
                    'is_worn' : log.is_worn,
                    'note' : log.note,
                });
            }else{
                tempLogs.push(log);
            }
        }
        // 最後のログについて
        // 日付変更時刻から最後のログの開始時間までの補填
        let last_log = Logs.latestAllRecords[Logs.latestAllRecords.length-1];
        let midnight = new Date(new Date(last_log.start_time).setHours(0,0,0,0))
        tempLogs.push({
            'id' : 0,
            'start_time' : Tools.convertToDbFormat(midnight),
            'end_time' : last_log.start_time,
            'is_worn' : !(last_log.is_worn),
            'note' : 'Auto Filling',
        });
        Logs.dailyRecordsByDailyGraph.push(tempLogs);
    },

    // グラフ形式ログ表示設定
    setRecordsToGraph: function(date){
        $('#graph .graph-contents .axis-graph .cover').css({
            'top': '',
            'height': '',
        });
        $('#graph .graph-contents .axis-graph .cover').addClass('covered');


        // グラフとメモの要素初期化
        $('#graph .graph-contents .axis-graph .base').empty();
        $('#graph .graph-contents .axis-note .base').empty();

        for(let i = 0; i < Logs.dailyRecordsByDailyGraph.length; i++){
            // 指定日(date)と同じ日付(開始時間)を持つログのみを対象とする
            if(Tools.compareDate(
                new Date(Logs.dailyRecordsByDailyGraph[i][0].start_time), date)){

                // 前のログの長さを一時保存
                // 次に算出した長さから引くために使う
                let total_mpp = 0;

                // 指定日(date)と同じ日付のログ配列をループ(id昇順)
                for(let j = Logs.dailyRecordsByDailyGraph[i].length - 1; 0 <= j; j--){
                   let log = Logs.dailyRecordsByDailyGraph[i][j];
                   let log_date = log.end_time ? new Date(log.end_time) : new Date();
                   let minutes = log_date.getHours() * 60 + log_date.getMinutes();

                   // 日跨ぎレコードの場合、高さ0が算出されるため回避
                   let mpp = minutes === 0 ? 480 : Math.floor(minutes / 3);
                   let bar_div = $('<div></div>');
                   if(log.is_worn){
                       // 装着中
                       bar_div.addClass('worn');
                   }else{
                       // 休憩中
                       bar_div.addClass('none');
                   }

                   bar_div.css({'height': (mpp - total_mpp) + 'px',});
                   $('#graph .graph-contents .axis-graph .base').append(bar_div);

                   // メモ要素(空の場合は表示しない方向で)
                   let note_div = $('<div class="note" data-val="' + j + '"></div>');
                   note_div.css({
                       'height': (mpp - total_mpp) + 'px',
                   });

                   if(log.note){
                       note_div.append('<span>' + Tools.shrinkNote(log.note) + '</span>');
                   }
                   $('#graph .graph-contents .axis-note .base').append(note_div);

                   // 次は今の高さ分を引く
                   total_mpp = mpp;

                }

                // 指定日が "今日" 場合(=ログ配列の最初のログのend_timeがnullなら)
                // 現在時刻までの分も加算する
                if(!Logs.dailyRecordsByDailyGraph[i][0].end_time){
                    let log_date = new Date();
                    let minutes = log_date.getHours() * 60 + log_date.getMinutes();
                    let mpp = Math.floor(minutes / 3);
                    let div = $('<div></div>');
                    if(Logs.dailyRecordsByDailyGraph[i][0].is_worn){
                        // 装着中
                       div.addClass('worn');
                    }else{
                        // 休憩中
                       div.addClass('none');

                    }
                    div.css({'height': (mpp - total_mpp) + 'px',});
                    $('#graph .graph-contents .axis-graph .base').append(div);
                } else {
                    // 指定日が '今日' じゃない場合(=ログ配列の最初のログのend_timeがnullじゃない)
                    // ログ配列最初のログ（時刻的には最後のログ）から
                    // 日付が変わる瞬間までの分を加算
                    let div = $('<div></div>');
                    if(Logs.dailyRecordsByDailyGraph[i][0].is_worn){
                        // 装着中
                       div.addClass('worn');
                    }else{
                        // 休憩中
                       div.addClass('none');

                    }
                    div.css({'height': (480 - total_mpp) + 'px',});
                    $('#graph .graph-contents .axis-graph .base').append(div);
                }
            }
        }

        $('#graph .graph-contents .axis-graph .cover').animate({
            'top': '800px',
            'height': '0px',
        }, 750, '', function(){
            $('#graph .graph-contents .axis-graph .cover').removeClass('covered');
        });
    },

    // グラフ形式 日付と累計情報
    setTargetDate: function(date){
        // 日付
        let tgt = $('#graph .date-picker .label-date .target-date');
        tgt.attr('date', Tools.convertToDbFormat(date));
        tgt.text(date.getFullYear() + '年'
            + (date.getMonth() + 1) + '月'
            + date.getDate() + '日')
        if(Tools.compareDate(date, new Date)){
            $('#graph .date-picker .btn-next').addClass('disabled');
        }else{
            $('#graph .date-picker .btn-next').removeClass('disabled');
        }

        // 累積
        $('#graph .date-picker .label-date .total .worn .total-hours ').text(Tools.padZero(0));
        $('#graph .date-picker .label-date .total .worn .total-minutes ').text(Tools.padZero(0));
        $('#graph .date-picker .label-date .total .worn .total-seconds ').text(Tools.padZero(0));

        $('#graph .date-picker .label-date .total .none .total-hours ').text(Tools.padZero(0));
        $('#graph .date-picker .label-date .total .none .total-minutes ').text(Tools.padZero(0));
        $('#graph .date-picker .label-date .total .none .total-seconds ').text(Tools.padZero(0));
        Logs.dailyRecords.forEach(function(logs){
            if(Tools.compareDate(logs.date, date)){
               // 表示セット
                $('#graph .date-picker .label-date .total .worn .total-hours ').text(Tools.padZero(logs.wornLogs.deltaHours));
                $('#graph .date-picker .label-date .total .worn .total-minutes ').text(Tools.padZero(logs.wornLogs.deltaMinutes));
                $('#graph .date-picker .label-date .total .worn .total-seconds ').text(Tools.padZero(logs.wornLogs.deltaSeconds));

                $('#graph .date-picker .label-date .total .none .total-hours ').text(Tools.padZero(logs.noneLogs.deltaHours));
                $('#graph .date-picker .label-date .total .none .total-minutes ').text(Tools.padZero(logs.noneLogs.deltaMinutes));
                $('#graph .date-picker .label-date .total .none .total-seconds ').text(Tools.padZero(logs.noneLogs.deltaSeconds));
            }
        });

    },

    // メモ詳細ダイアログ表示
    showNoteDetail: function(dataVal){
        let targetDate = new Date($('#graph .date-picker .label-date span').attr('date'));
        let note = "";
        Logs.dailyRecordsByDailyGraph.forEach(function(log){
           if(Tools.compareDate(new Date(log[0].start_time), targetDate)){
               note = log[dataVal].note;
           }
        });
        $('#note-detail-input').val(note);
        $('.note-detail').removeClass('disabled');
        $('.note-detail').attr('data-val', dataVal);
        $('#graph .axis-note .note-detail .body').removeClass('disabled');
         M.textareaAutoResize($('#note-detail-input'));
        // setTimeout(function(){
        //     $('#note-detail-input').focus()
        // }, 100);
        // $('#note-detail-input').blur();
    },

    // メモ詳細ダイアログ非表示
    hideNoteDetail: function(){
        $('.note-detail').addClass('disabled');
        $('#graph .axis-note .note-detail .body').addClass('disabled');
    },

    // メモ保存
    saveNote: function(){
        // 表示中の日付を取得
        let targetDate = new Date($('#graph .date-picker .label-date span').attr('date'));
        // 表示中のメモを保持するログの要素番号
        let dataVal = parseInt($('.note-detail').attr('data-val'));
        let targetLog = {};
        // 検索
        Logs.dailyRecordsByDailyGraph.forEach(function(logs){
           if(Tools.compareDate(new Date(logs[0].start_time), targetDate)){
               targetLog = logs[dataVal];
           }
        });

        // 取得API
        $.ajax({
            "url": "http://127.0.0.1:8000/star_timer/list/" + targetLog.id + "/",
            "type": "GET",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "success": function(result) {
                // 更新用データ
                let updateData = {
                    "start_time": result.start_time,
                    "end_time": result.end_time,
                    "is_worn": result.is_worn,
                    "note": $('#note-detail-input').val(),
                }
                // 更新API
                $.ajax({
                    "url": "http://127.0.0.1:8000/star_timer/list/" + targetLog.id + "/",
                    "type": "PUT",
                    "cache": false,
                    "dataType": "json",
                    "headers": {
                        "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
                    },
                    "data": updateData,
                    "success": function() {
                        Logs.getTimerRecords(function(){
                            // メモダイアログを閉じる
                            Logs.hideNoteDetail();
                            // グラフ再描画
                            Logs.getRecordsToGraph();
                            Logs.setRecordsToGraph(targetDate);
                            // お知らせ
                            M.toast({html: 'めもの内容を保存しました'});
                        });

                    },
                    "error": function (e) {
                        alert('Error:' + e);
                    }
                });

            },
            "error": function (e) {
                alert('Error:' + e);
            }
        });





    },

};

let Tools = {
    // タイマー用数値の0パディング
    padZero: function (number) {
        return ('00' + number).slice(-2);
    },

    // 秒換算 ([deltaDate, deltaHours, deltaMinutes, deltaSeconds])
    // deltaDateは使わないので無視
    convertToSeconds: function(log){
        return log.deltaHours * 60 * 60 + log.deltaMinutes * 60 + log.deltaSeconds;
    },

    convertToDatetime: function(seconds){
        let h = seconds / 3600 | 0;
        let m = (seconds - (h * 3600)) / 60 | 0;
        let s = seconds - (h * 3600) - (m * 60);

        return {
            'deltaDate': 0,
            'deltaHours': h,
            'deltaMinutes': m,
            'deltaSeconds': s,
        }
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

    // 年月日一致確認
    compareDate: function(a, b){
      if(a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()){
          return true;
      }
      return false;

    },

    shrinkNote: function(str){
      if(str.length > 8){
          return str.slice(0, 7) + '...';
      }
      return str;
    },
};

Logs.init();