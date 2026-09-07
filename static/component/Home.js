export default {
    template: `
    <div>
        <!-- HERO SECTION -->
        <section class="tk-hero">
            <div class="tk-hero-bg">
                <img src="/static/trekking_bg.png" alt="Trekking Adventure">
            </div>
            <div class="tk-hero-overlay"></div>
            <div class="tk-hero-content">
                <div class="tk-hero-badge">
                    ⛰️ &nbsp; Premium Trekking & Expeditions
                </div>
                <h1 class="tk-hero-title">
                    Conquer Every<br><span>Mountain Trail</span>
                </h1>
                <p class="tk-hero-desc">
                    Discover breathtaking treks across India's most stunning Himalayan passes and alpine meadows.
                    Book guided adventures, track verified bookings, and conquer summits safely.
                </p>
                <div class="tk-hero-actions">
                    <router-link :to="isLoggedIn ? '/dashboard' : '/register'" class="tk-btn tk-btn-gold tk-btn-lg">
                        {{ isLoggedIn ? '🏕️ Go to Dashboard' : '🚀 Start Your Adventure' }}
                    </router-link>
                    <a href="#featured-treks" class="tk-btn tk-btn-outline tk-btn-lg">
                        🧭 Explore Treks
                    </a>
                </div>
            </div>

            <!-- Floating Stats -->
            <div class="tk-hero-stats">
                <div class="tk-hero-stat">
                    <span class="tk-hero-stat-number">50+</span>
                    <div class="tk-hero-stat-label">Himalayan Trails</div>
                </div>
                <div class="tk-hero-stat">
                    <span class="tk-hero-stat-number">100%</span>
                    <div class="tk-hero-stat-label">Certified Guides</div>
                </div>
                <div class="tk-hero-stat">
                    <span class="tk-hero-stat-number">4.9★</span>
                    <div class="tk-hero-stat-label">Trekker Rating</div>
                </div>
            </div>
        </section>

        <!-- FEATURED EXPEDITIONS PREVIEW -->
        <section id="featured-treks" style="background: var(--snow); padding: 5rem 2rem;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:2.5rem;flex-wrap:wrap;gap:1rem;">
                    <div>
                        <span style="color:var(--forest-light);font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Curated Expeditions</span>
                        <h2 style="font-family:'Playfair Display',serif;font-size:2.2rem;color:var(--text-primary);margin-top:4px;">
                            Trending Mountain Trails
                        </h2>
                    </div>
                    <router-link :to="isLoggedIn ? '/dashboard' : '/register'" class="tk-btn tk-btn-ghost-green tk-btn-sm">
                        View All Expeditions →
                    </router-link>
                </div>

                <div class="tk-trek-grid">
                    <div v-for="trek in featuredTreks" :key="trek.name" class="tk-trek-card">
                        <div class="tk-trek-card-media">
                            <span class="tk-trek-card-icon">{{ trek.icon }}</span>
                            <span class="tk-trek-card-badge">
                                <span class="tk-badge" :class="trek.difficulty === 'Easy' ? 'tk-difficulty-easy' : trek.difficulty === 'Moderate' ? 'tk-difficulty-moderate' : 'tk-difficulty-hard'">
                                    {{ trek.difficulty }}
                                </span>
                            </span>
                            <div class="tk-trek-card-slots">
                                <span>🏔️ {{ trek.altitude }}</span>
                            </div>
                        </div>
                        <div class="tk-trek-card-body">
                            <h5 class="tk-trek-card-title">{{ trek.name }}</h5>
                            <div class="tk-trek-card-location">📍 {{ trek.location }}</div>
                            <div class="tk-trek-card-desc">{{ trek.desc }}</div>
                            <div class="tk-trek-card-meta">
                                <div><strong>⏱️ Duration:</strong> {{ trek.duration }}</div>
                                <div><strong>🎯 Best Season:</strong> {{ trek.season }}</div>
                            </div>
                        </div>
                        <div class="tk-trek-card-footer">
                            <div class="tk-trek-card-price">
                                ₹{{ trek.price }} <span>/ person</span>
                            </div>
                            <router-link :to="isLoggedIn ? '/dashboard' : '/login'" class="tk-btn tk-btn-primary tk-btn-sm">
                                🎒 Book Now
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- INTERACTIVE TREK FINDER -->
        <section style="background: white; padding: 4.5rem 2rem; border-top: 1px solid var(--border);">
            <div style="max-width: 960px; margin: 0 auto; text-align: center;">
                <span class="tk-badge tk-badge-stone" style="margin-bottom: 0.75rem;">Interactive Guide</span>
                <h2 style="font-family:'Playfair Display',serif;font-size:2rem;color:var(--text-primary);margin-bottom:0.75rem;">
                    Find Your Ideal Expedition
                </h2>
                <p style="color:var(--text-muted);font-size:0.95rem;max-width:520px;margin:0 auto 2rem;">
                    Select your experience level to see the recommended route for your next mountain adventure.
                </p>

                <!-- Filter Pills -->
                <div style="display:flex;justify-content:center;gap:10px;margin-bottom:2rem;flex-wrap:wrap;">
                    <button
                        v-for="level in levels"
                        :key="level.id"
                        class="tk-btn"
                        :class="selectedLevel === level.id ? 'tk-btn-primary' : 'tk-btn-outline'"
                        @click="selectedLevel = level.id"
                        style="border-radius:var(--radius-pill);padding:8px 20px;"
                    >
                        {{ level.label }}
                    </button>
                </div>

                <!-- Recommendation Card -->
                <div style="background:var(--snow);border:1px solid var(--border);border-radius:var(--radius-xl);padding:2rem;display:flex;align-items:center;gap:2rem;text-align:left;flex-wrap:wrap;">
                    <div style="font-size:4rem;background:white;width:90px;height:90px;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);flex-shrink:0;">
                        {{ currentRecommendation.icon }}
                    </div>
                    <div style="flex:1;min-width:260px;">
                        <span class="tk-badge" :class="currentRecommendation.badgeClass" style="margin-bottom:6px;">
                            {{ currentRecommendation.difficulty }} Match
                        </span>
                        <h3 style="font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--forest);margin-bottom:6px;">
                            {{ currentRecommendation.name }}
                        </h3>
                        <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.5;margin-bottom:10px;">
                            {{ currentRecommendation.description }}
                        </p>
                        <div style="font-size:0.85rem;color:var(--text-muted);">
                            📍 <strong>Region:</strong> {{ currentRecommendation.region }} &nbsp;|&nbsp; ⏱️ <strong>Duration:</strong> {{ currentRecommendation.duration }}
                        </div>
                    </div>
                    <router-link :to="isLoggedIn ? '/dashboard' : '/register'" class="tk-btn tk-btn-gold">
                        Reserve Slot →
                    </router-link>
                </div>
            </div>
        </section>

        <!-- WHY CHOOSE TREKKARO -->
        <section style="background: var(--snow); padding: 4.5rem 2rem;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 3rem;">
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--text-primary); margin-bottom: 0.75rem;">
                        Why Trekkers Choose TrekKaro
                    </h2>
                    <p style="color: var(--text-muted); font-size: 1rem; max-width: 520px; margin: 0 auto;">
                        Engineered for safety, transparency, and seamless expedition management.
                    </p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                    <div class="tk-stat-card" style="text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🗺️</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Hand-Picked Routes</div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Carefully verified trails with detailed altitude charts and safety checkpoints.</div>
                    </div>
                    <div class="tk-stat-card" style="text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🧭</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Safety-Certified Guides</div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Led exclusively by certified mountaineering instructors equipped with medical first-aid.</div>
                    </div>
                    <div class="tk-stat-card" style="text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎫</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Digital E-Passes</div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Instant booking vouchers and downloadable boarding passes for swift base-camp check-in.</div>
                    </div>
                    <div class="tk-stat-card" style="text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">📊</div>
                        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Transparent Reports</div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Instant CSV reports and complete booking audit trail for users and tour organizers.</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA BANNER -->
        <section style="background: linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%); padding: 4.5rem 2rem; text-align: center; color: white;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 2.3rem; margin-bottom: 1rem;">
                Ready to Summit Your Next Peak?
            </h2>
            <p style="color: rgba(255,255,255,0.78); font-size: 1.05rem; max-width: 520px; margin: 0 auto 2rem;">
                Join the TrekKaro family today. Verified guides, transparent bookings, and memories that last a lifetime.
            </p>
            <router-link :to="isLoggedIn ? '/dashboard' : '/register'" class="tk-btn tk-btn-gold tk-btn-lg">
                🏔️ {{ isLoggedIn ? 'Open Dashboard' : 'Create Free Account' }}
            </router-link>
        </section>
    </div>
    `,
    data() {
        return {
            isLoggedIn: !!localStorage.getItem('auth-token'),
            selectedLevel: 'beginner',
            levels: [
                { id: 'beginner', label: '🌱 Beginner' },
                { id: 'intermediate', label: '🏕️ Moderate' },
                { id: 'advanced', label: '⛰️ Expert' }
            ],
            recommendations: {
                beginner: {
                    name: 'Kedarkantha Winter Wonderland',
                    difficulty: 'Easy',
                    badgeClass: 'tk-difficulty-easy',
                    icon: '❄️',
                    region: 'Sankri, Uttarakhand',
                    duration: '5 Days',
                    description: 'Perfect maiden trek featuring pristine pine forests, knee-deep snow trails, and a 360-degree panorama of Himalayan giants.'
                },
                intermediate: {
                    name: 'Hampta Pass & Chandratal Lake',
                    difficulty: 'Moderate',
                    badgeClass: 'tk-difficulty-moderate',
                    icon: '🏞️',
                    region: 'Manali to Spiti, Himachal Pradesh',
                    duration: '6 Days',
                    description: 'A dramatic landscape crossover trek starting from lush green Kullu meadows and ending in the barren, moon-like Spiti valley.'
                },
                advanced: {
                    name: 'Roopkund High Altitude Mystery Lake',
                    difficulty: 'Hard',
                    badgeClass: 'tk-difficulty-hard',
                    icon: '🏔️',
                    region: 'Chamoli, Uttarakhand',
                    duration: '8 Days',
                    description: 'An exhilarating high-altitude expedition to 15,750 ft with grand views of Mt. Trishul and the legendary skeletal mystery lake.'
                }
            },
            featuredTreks: [
                {
                    name: 'Kedarkantha Summit',
                    location: 'Uttarakhand',
                    difficulty: 'Easy',
                    altitude: '12,500 ft',
                    duration: '5 Days',
                    season: 'Dec - Apr',
                    price: 8500,
                    icon: '❄️',
                    desc: 'Classic winter trek famous for summit sunrises and camping amid snowy pine clearings.'
                },
                {
                    name: 'Hampta Pass Crossing',
                    location: 'Himachal Pradesh',
                    difficulty: 'Moderate',
                    altitude: '14,100 ft',
                    duration: '6 Days',
                    season: 'Jun - Oct',
                    price: 10500,
                    icon: '🏞️',
                    desc: 'Dramatic crossover from green Kullu pine forests to rugged barren Spiti desert.'
                },
                {
                    name: 'Valley of Flowers & Hemkund',
                    location: 'Uttarakhand',
                    difficulty: 'Moderate',
                    altitude: '14,400 ft',
                    duration: '6 Days',
                    season: 'Jul - Sep',
                    price: 9800,
                    icon: '🌸',
                    desc: 'UNESCO World Heritage botanical paradise bursting with over 500 species of alpine wild flowers.'
                }
            ]
        }
    },
    computed: {
        currentRecommendation() {
            return this.recommendations[this.selectedLevel] || this.recommendations.beginner
        }
    },
    watch: {
        '$route'() {
            this.isLoggedIn = !!localStorage.getItem('auth-token')
        }
    }
}