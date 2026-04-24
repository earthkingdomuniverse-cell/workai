export class StatsTracker {
  private startTime: number = Date.now();
  private stats = {
    users: 0,
    offers: 0,
    requests: 0,
    deals: 0,
    errors: 0,
  };

  increment(type: keyof typeof this.stats) {
    this.stats[type]++;
  }

  logProgress() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    console.log(`\n📊 [Progress] Elapsed: ${elapsed}s | Users: ${this.stats.users} | Offers: ${this.stats.offers} | Requests: ${this.stats.requests} | Deals: ${this.stats.deals} | Errors: ${this.stats.errors}`);
  }

  logError(message: string, error?: any) {
    this.stats.errors++;
    console.error(`❌ [Error] ${message}`, error?.message || error || '');
  }

  logSuccess(message: string) {
    console.log(`✅ [Success] ${message}`);
  }
  
  logInfo(message: string) {
    console.log(`ℹ️ [Info] ${message}`);
  }

  summary() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    console.log('\n=======================================');
    console.log('🎉 SWARM EXECUTION SUMMARY');
    console.log('=======================================');
    console.log(`⏱️  Total Time: ${elapsed}s`);
    console.log(`👥 Users Created: ${this.stats.users}`);
    console.log('📦 Offers Created: ' + this.stats.offers);
    console.log('📝 Requests Created: ' + this.stats.requests);
    console.log('🤝 Deals Completed: ' + this.stats.deals);
    console.log('❌ Errors Encountered: ' + this.stats.errors);
    console.log('=======================================\n');
  }
}
