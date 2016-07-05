<div class="tab_wrap">
	<ul class="tab_menu">
	<li <?php fe_print_selected($depth3,'info',2); ?>><a href="<?= site_url('friendly/aboutSingapore/info') ?>">기본 정보</a></li> <!--[D] 선택된 항목에 .selected 추가 -->
	<li <?php fe_print_selected($depth3,'recommend',2); ?>><a href="<?= site_url('friendly/aboutSingapore/recommend') ?>">추천 정보</a></li>
	<li <?php fe_print_selected($depth3,'useful',2); ?>><a href="<?= site_url('friendly/aboutSingapore/useful') ?>">유용한 정보</a></li>
	</ul>
</div>