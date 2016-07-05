<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
<meta property="og:site_name" content="<?= config_item('title'); ?>" />
<meta property="og:title" content="<?= $title; ?>" />
<meta property="og:type" content="website" />
<title><?= $title; ?></title>
<link rel="shortcut icon" type="image/x-icon" href="<?= $ast_url; ?>/img/favicon.ico">
<link rel="apple-touch-icon-precomposed" href="<?= $ast_url; ?>/img/favicon.png" sizes="152x152">
<link rel="icon" href="<?= $ast_url; ?>/img/favicon-32.png" sizes="32x32">
<script src="<?= $ast_url; ?>/js/sc.common.js"></script>
<script src="<?= $ast_url; ?>/js/sc.js"></script>
<script src="<?= $ast_url; ?>/js/src/form.js"></script>
<?php if($rfcl == 'main'){?>
<script src="<?= $ast_url; ?>/js/pages/entry.js"></script>
<!-- <script src="<?= $ast_url; ?>/js/sc.entry.js"></script> -->
<?php }?>
<script>
(function($, win) {
	$(function() {
		var container = $('body');		
		sc.Form.Csrf.init(container, { csrf : { name : '<?= $csrf_name; ?>' } });
	});
})(jQuery, window);
</script>
</head>
<body>
<?= form_open('', 'id="_commonFrm" method="get"', array('back_url' => $back_url)); ?>
<input type="hidden" name="<?= $csrf_name ?>" value="<?= $this->security->get_csrf_hash(); ?>" style="display:none;" />
<?= form_close(); ?>