<div id="wrap" <?php if(in_array($rfcl, array('privacy', 'terms'))) echo ' class="terms_wrap"';?>>
	<!-- [D] HEADER -->
	<div id="header" role="banner">
		<div class="inner">
			<h1 class="logo"><a href="<?= site_url(); ?>"><span class="sp">YourSingapore Ultimate Adventure</span></a></h1>
			<button type="button" class="btn_menu"><span class="sp">메뉴열기</span></button>
			<!-- [D] 모바일 화면 변환 시 초기 : display:none -->
			<div class="m_lnb">
				<!-- [D] local navigation bar -->
				<div id="lnb" role="navigation">
					<ul class="lnb_menu">
					<!-- [D] 메뉴 선택 시 .selected 추가 -->
					<li <?= fe_get_class_selected($rfcl,'friendly'); ?>>
						<a href="<?= site_url('friendly')?>" class="lnb01"><span class="sp">싱가포르와 친해지기</span></a>
						<button type="button" class="btn_open"><span class="sp">하위메뉴 보기</span></button>
						<ul class="sub_menu">
						<!-- [D] 메뉴 선택 시 .selected 추가 -->
						<li <?= fe_get_class_selected($rfmt,'aboutSingapore'); ?>><a href="<?= site_url('friendly/aboutSingapore')?>">싱가포르 소개</a></li>
						<li <?= fe_get_class_selected($rfmt,'spot'); ?>><a href="<?= site_url('friendly/spot')?>">스팟</a></li>
						</ul>
					</li>
					<li <?= fe_get_class_selected($rfcl,'getInto'); ?>>
						<a href="<?= site_url('getInto')?>" class="lnb02"><span class="sp">싱가포르에 빠져보기</span></a>
						<button type="button" class="btn_open"><span class="sp">하위메뉴 보기</span></button>
						<ul class="sub_menu">
						<!-- [D] 메뉴 선택 시 .selected 추가 -->
						<li <?= fe_get_class_selected($rfmt,'family'); ?>><a href="<?= site_url('getInto/family')?>">패밀리 투어</a></li>
						<li <?= fe_get_class_selected($rfmt,'exciting'); ?>><a href="<?= site_url('getInto/exciting')?>">익사이팅 투어</a></li>
						<li <?= fe_get_class_selected($rfmt,'romantic'); ?>><a href="<?= site_url('getInto/romantic')?>">로맨틱 투어</a></li>
						<li <?= fe_get_class_selected($rfmt,'trendy'); ?>><a href="<?= site_url('getInto/trendy')?>">트렌디 투어</a></li>
						<li <?= fe_get_class_selected($rfmt,'epicureanism'); ?>><a href="<?= site_url('getInto/epicureanism')?>">미식 투어</a></li>
						</ul>
					</li>
					<li <?= fe_get_class_selected($rfcl,'flyOut'); ?>>
						<a href="<?= site_url('flyOut')?>" class="lnb03"><span class="sp">싱가포르로 떠나기</span></a>
						<button type="button" class="btn_open"><span class="sp">하위메뉴 보기</span></button>
						<ul class="sub_menu">
						<li <?= fe_get_class_selected($rfmt,'product'); ?>><a href="<?= site_url('flyOut/product')?>">프로덕트</a></li>
						<li <?= fe_get_class_selected($rfmt,'schedule'); ?>><a href="<?= site_url('flyOut/schedule')?>">비행 스케쥴</a></li>
						<li <?= fe_get_class_selected($rfmt,'premiumService'); ?>><a href="<?= site_url('flyOut/premiumService')?>">프리미엄 서비스</a></li>
						</ul>
					</li>
					</ul>
				</div>
				<!-- //[D] local navigation bar -->
				<button type="button" class="btn_close"><span class="sp">메뉴 닫기</span></button>
			</div>
			<div class="dimmed"></div>
		</div>
	</div>
	<!-- //[D] HEADER -->

	<hr>

	<!-- [D] CONTAINER -->
	<div id="container">