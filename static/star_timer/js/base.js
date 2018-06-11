let Base = {

    // 初期処理
    init: function () {
        Base.attachEvents();
    },

    // 各種イベント処理 付加
    attachEvents: function () {
        // 画面更新ボタンを押したとき
        $(document).on('click', '.tool-item .reload', function(){
            location.reload(true);
        });

        // 履歴とかのページ移動ボタンを押したとき
        $(document).on('click', '.tool-item .logs', function(){
           location.href = '/star_timer/logs/';
        });

        // トップに戻るボタンを押したとき
        $(document).on('click', '.tool-item .back', function(){
           location.href = '../';
        });

        // わっつにゅう ボタン
        $(document).on('click', '.tool-item .new-release', function(){
           location.href = '/star_timer/new_release/';
        });

        // ツールパネル開閉ボタン
        $(document).on('click', '.btn-lever', function(){
           Base.toggleToolPanel();
        });
    },

    // ツールパネル開閉
    toggleToolPanel: function(){
        if($('.btn-lever i').text() === 'expand_more'){
            // 開く
            $('.tool-row:gt(0)')
                .css({'display': 'flex'})
                .animate({'height':'128px'}, 300, 'swing', function(){
                    $('.btn-lever i').text('expand_less');
                });
        }else{
            // 閉じる
            $('.tool-row:gt(0)')
                .animate({'height':'0px'}, 300, 'swing', function(){
                    $('.btn-lever i').text('expand_more');
                    $('.tool-row:gt(0)').css({'display': 'none'});
                });
        }
    },

}

Base.init();