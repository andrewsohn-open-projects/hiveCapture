<div class="tab_wrap type2">
	<ul class="tab_menu">
	<li <?php fe_print_selected($idx,'intro',2); ?>><a href="<?= site_url('flyOut/product/intro') ?>">싱가포르항공 소개</a></li> <!--[D] 선택된 항목에 .selected 추가 -->
	<li <?php fe_print_selected($idx,'specialService',2); ?>><a href="<?= site_url('flyOut/product/specialService') ?>">특별 서비스</a></li>
	<li <?php fe_print_selected($idx,'product',2); ?>><a href="<?= site_url('flyOut/product/product') ?>">상품 소개</a></li>
	<li <?php fe_print_selected($idx,'classSeat',2); ?>><a href="<?= site_url('flyOut/product/classSeat') ?>">클래스 별 좌석 소개</a></li>
	<li><a href="http://www.singaporeair.com/ko_KR/special-offers/localpromo-kr/" target="_blank">특별한 이벤트</a></li>
	</ul>
</div>