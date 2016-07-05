<div class="tab_wrap">
	<ul class="tab_menu">
	<li <?php fe_print_selected($idx,'globe',2); ?>><a href="<?= site_url('flyOut/premiumService/globe') ?>">국제 요리사 자문단</a></li> <!--[D] 선택된 항목에 .selected 추가 -->
	<li <?php fe_print_selected($idx,'wine',2); ?>><a href="<?= site_url('flyOut/premiumService/wine') ?>">와인 컨설턴트</a></li>
	<li <?php fe_print_selected($idx,'book',2); ?>><a href="<?= site_url('flyOut/premiumService/book') ?>">북 더 쿡</a></li>
	</ul>
</div>